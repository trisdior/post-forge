require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

// --- Database Setup ---
const db = new Database(path.join(__dirname, 'brain.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS quick_captures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    processed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes(tags);
  CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
`);

// --- Prepared Statements ---
const stmt = {
  addNote: db.prepare('INSERT INTO notes (user_id, title, content, tags, category) VALUES (?, ?, ?, ?, ?)'),
  getNote: db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?'),
  deleteNote: db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?'),
  listNotes: db.prepare('SELECT id, title, category, tags, pinned, created_at FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC LIMIT ? OFFSET ?'),
  searchNotes: db.prepare('SELECT id, title, content, category, tags FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ? OR tags LIKE ?) ORDER BY updated_at DESC LIMIT 10'),
  countNotes: db.prepare('SELECT COUNT(*) as count FROM notes WHERE user_id = ?'),
  pinNote: db.prepare('UPDATE notes SET pinned = ? WHERE id = ? AND user_id = ?'),
  editNote: db.prepare('UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'),
  tagNote: db.prepare('UPDATE notes SET tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'),
  listByCategory: db.prepare('SELECT id, title, tags, pinned, created_at FROM notes WHERE user_id = ? AND category = ? ORDER BY pinned DESC, updated_at DESC LIMIT 20'),
  listByTag: db.prepare('SELECT id, title, category, pinned, created_at FROM notes WHERE user_id = ? AND tags LIKE ? ORDER BY updated_at DESC LIMIT 20'),
  listCategories: db.prepare('SELECT DISTINCT category, COUNT(*) as count FROM notes WHERE user_id = ? GROUP BY category ORDER BY count DESC'),
  capture: db.prepare('INSERT INTO quick_captures (user_id, content) VALUES (?, ?)'),
  getCaptures: db.prepare('SELECT * FROM quick_captures WHERE user_id = ? AND processed = 0 ORDER BY created_at DESC LIMIT 20'),
  clearCaptures: db.prepare('UPDATE quick_captures SET processed = 1 WHERE user_id = ?'),
};

// --- Discord Bot ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const PREFIX = '!';

// Color palette
const COLORS = {
  primary: 0x5865F2,   // Discord blurple
  success: 0x57F287,
  warning: 0xFEE75C,
  error: 0xED4245,
  info: 0x5865F2,
};

// --- Command Handlers ---
const commands = {
  // Save a note: !save [category] Title | Content #tag1 #tag2
  async save(msg, args) {
    const full = args.join(' ');
    if (!full) return msg.reply('Usage: `!save [category] Title | Content #tag1 #tag2`');

    let category = 'general';
    let rest = full;

    // Check for [category]
    const catMatch = full.match(/^\[(\w+)\]\s*/);
    if (catMatch) {
      category = catMatch[1].toLowerCase();
      rest = full.slice(catMatch[0].length);
    }

    // Extract tags
    const tags = [];
    rest = rest.replace(/#(\w+)/g, (_, tag) => { tags.push(tag.toLowerCase()); return ''; }).trim();

    // Split title | content
    const parts = rest.split('|').map(s => s.trim());
    const title = parts[0] || 'Untitled';
    const content = parts.slice(1).join('|').trim() || title;

    const result = stmt.addNote.run(msg.author.id, title, content, tags.join(','), category);

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle('💾 Saved to Brain')
      .addFields(
        { name: 'Title', value: title, inline: true },
        { name: 'ID', value: `#${result.lastInsertRowid}`, inline: true },
        { name: 'Category', value: `📁 ${category}`, inline: true },
      )
      .setTimestamp();
    if (tags.length) embed.addFields({ name: 'Tags', value: tags.map(t => `\`${t}\``).join(' ') });
    msg.reply({ embeds: [embed] });
  },

  // Quick capture: !q whatever is on your mind
  async q(msg, args) {
    const content = args.join(' ');
    if (!content) return msg.reply('Usage: `!q your thought here`');
    stmt.capture.run(msg.author.id, content);
    msg.react('🧠');
  },

  // View captures: !inbox
  async inbox(msg) {
    const captures = stmt.getCaptures.all(msg.author.id);
    if (!captures.length) return msg.reply('📭 Inbox empty — brain is clear!');

    const list = captures.map((c, i) => `**${i + 1}.** ${c.content} — *${new Date(c.created_at).toLocaleDateString()}*`).join('\n');
    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle('📥 Brain Inbox')
      .setDescription(list)
      .setFooter({ text: 'Use !clear to mark all processed' });
    msg.reply({ embeds: [embed] });
  },

  // Clear inbox: !clear
  async clear(msg) {
    stmt.clearCaptures.run(msg.author.id);
    msg.reply('✅ Inbox cleared.');
  },

  // View a note: !view <id>
  async view(msg, args) {
    const id = parseInt(args[0]);
    if (!id) return msg.reply('Usage: `!view <id>`');
    const note = stmt.getNote.get(id, msg.author.id);
    if (!note) return msg.reply('❌ Note not found.');

    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle(`📝 #${note.id} — ${note.title}`)
      .setDescription(note.content)
      .addFields(
        { name: 'Category', value: `📁 ${note.category}`, inline: true },
        { name: 'Tags', value: note.tags ? note.tags.split(',').map(t => `\`${t}\``).join(' ') : 'none', inline: true },
        { name: 'Pinned', value: note.pinned ? '📌 Yes' : 'No', inline: true },
      )
      .setFooter({ text: `Created: ${note.created_at} | Updated: ${note.updated_at}` });
    msg.reply({ embeds: [embed] });
  },

  // List notes: !notes [page]
  async notes(msg, args) {
    const page = Math.max(1, parseInt(args[0]) || 1);
    const perPage = 10;
    const offset = (page - 1) * perPage;
    const notes = stmt.listNotes.all(msg.author.id, perPage, offset);
    const total = stmt.countNotes.get(msg.author.id).count;

    if (!notes.length) return msg.reply('🧠 Brain is empty. Start with `!save` or `!q`');

    const list = notes.map(n => {
      const pin = n.pinned ? '📌 ' : '';
      const tags = n.tags ? ` ${n.tags.split(',').map(t => `\`${t}\``).join(' ')}` : '';
      return `${pin}**#${n.id}** ${n.title} — 📁 ${n.category}${tags}`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle('🧠 Your Brain')
      .setDescription(list)
      .setFooter({ text: `Page ${page}/${Math.ceil(total / perPage)} • ${total} total notes` });
    msg.reply({ embeds: [embed] });
  },

  // Search: !search <query>
  async search(msg, args) {
    const query = args.join(' ');
    if (!query) return msg.reply('Usage: `!search <query>`');
    const pattern = `%${query}%`;
    const results = stmt.searchNotes.all(msg.author.id, pattern, pattern, pattern);

    if (!results.length) return msg.reply(`🔍 No results for "${query}"`);

    const list = results.map(n => {
      const preview = n.content.length > 80 ? n.content.slice(0, 80) + '...' : n.content;
      return `**#${n.id}** ${n.title}\n> ${preview}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle(`🔍 Results for "${query}"`)
      .setDescription(list);
    msg.reply({ embeds: [embed] });
  },

  // Delete: !delete <id>
  async delete(msg, args) {
    const id = parseInt(args[0]);
    if (!id) return msg.reply('Usage: `!delete <id>`');
    const result = stmt.deleteNote.run(id, msg.author.id);
    if (result.changes) msg.reply(`🗑️ Note #${id} deleted.`);
    else msg.reply('❌ Note not found.');
  },

  // Pin/unpin: !pin <id>
  async pin(msg, args) {
    const id = parseInt(args[0]);
    if (!id) return msg.reply('Usage: `!pin <id>`');
    const note = stmt.getNote.get(id, msg.author.id);
    if (!note) return msg.reply('❌ Note not found.');
    const newPin = note.pinned ? 0 : 1;
    stmt.pinNote.run(newPin, id, msg.author.id);
    msg.reply(newPin ? `📌 Note #${id} pinned.` : `📌 Note #${id} unpinned.`);
  },

  // Edit: !edit <id> new content
  async edit(msg, args) {
    const id = parseInt(args[0]);
    const content = args.slice(1).join(' ');
    if (!id || !content) return msg.reply('Usage: `!edit <id> new content`');
    const result = stmt.editNote.run(content, id, msg.author.id);
    if (result.changes) msg.reply(`✏️ Note #${id} updated.`);
    else msg.reply('❌ Note not found.');
  },

  // Tag: !tag <id> #tag1 #tag2
  async tag(msg, args) {
    const id = parseInt(args[0]);
    if (!id) return msg.reply('Usage: `!tag <id> #tag1 #tag2`');
    const tags = [];
    args.slice(1).join(' ').replace(/#(\w+)/g, (_, t) => tags.push(t.toLowerCase()));
    if (!tags.length) return msg.reply('Add tags with # like: `!tag 1 #idea #urgent`');
    const note = stmt.getNote.get(id, msg.author.id);
    if (!note) return msg.reply('❌ Note not found.');
    const existing = note.tags ? note.tags.split(',') : [];
    const merged = [...new Set([...existing, ...tags])].join(',');
    stmt.tagNote.run(merged, id, msg.author.id);
    msg.reply(`🏷️ Note #${id} tagged: ${merged.split(',').map(t => `\`${t}\``).join(' ')}`);
  },

  // Categories: !categories
  async categories(msg) {
    const cats = stmt.listCategories.all(msg.author.id);
    if (!cats.length) return msg.reply('No categories yet.');
    const list = cats.map(c => `📁 **${c.category}** — ${c.count} notes`).join('\n');
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle('📁 Categories')
      .setDescription(list);
    msg.reply({ embeds: [embed] });
  },

  // Browse category: !cat <name>
  async cat(msg, args) {
    const category = (args[0] || '').toLowerCase();
    if (!category) return msg.reply('Usage: `!cat <category>`');
    const notes = stmt.listByCategory.all(msg.author.id, category);
    if (!notes.length) return msg.reply(`📁 No notes in "${category}"`);
    const list = notes.map(n => `${n.pinned ? '📌 ' : ''}**#${n.id}** ${n.title}`).join('\n');
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle(`📁 ${category}`)
      .setDescription(list);
    msg.reply({ embeds: [embed] });
  },

  // Browse tag: !tagged <tag>
  async tagged(msg, args) {
    const t = (args[0] || '').toLowerCase().replace('#', '');
    if (!t) return msg.reply('Usage: `!tagged <tag>`');
    const notes = stmt.listByTag.all(msg.author.id, `%${t}%`);
    if (!notes.length) return msg.reply(`🏷️ No notes tagged "${t}"`);
    const list = notes.map(n => `${n.pinned ? '📌 ' : ''}**#${n.id}** ${n.title} — 📁 ${n.category}`).join('\n');
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle(`🏷️ #${t}`)
      .setDescription(list);
    msg.reply({ embeds: [embed] });
  },

  // Help
  async help(msg) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle('🧠 2nd Brain — Commands')
      .setDescription('Your personal knowledge base.')
      .addFields(
        { name: '💾 Save & Capture', value: [
          '`!save [cat] Title | Content #tags` — Save a note',
          '`!q thought` — Quick capture to inbox',
        ].join('\n') },
        { name: '📖 Browse & Search', value: [
          '`!notes [page]` — List all notes',
          '`!view <id>` — View a note',
          '`!search <query>` — Search notes',
          '`!categories` — List categories',
          '`!cat <name>` — Browse category',
          '`!tagged <tag>` — Browse by tag',
        ].join('\n') },
        { name: '✏️ Edit & Organize', value: [
          '`!edit <id> content` — Edit note',
          '`!tag <id> #tags` — Add tags',
          '`!pin <id>` — Pin/unpin',
          '`!delete <id>` — Delete note',
        ].join('\n') },
        { name: '📥 Inbox', value: [
          '`!inbox` — View quick captures',
          '`!clear` — Clear inbox',
        ].join('\n') },
      );
    msg.reply({ embeds: [embed] });
  },
};

// --- Event Handlers ---
client.once('ready', () => {
  console.log(`🧠 2nd Brain online as ${client.user.tag}`);
  client.user.setActivity('!help | Your 2nd Brain', { type: 3 }); // WATCHING
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  const [cmdName, ...args] = msg.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = commands[cmdName?.toLowerCase()];
  if (!command) return;

  try {
    await command(msg, args);
  } catch (err) {
    console.error(`Error in !${cmdName}:`, err);
    msg.reply('❌ Something went wrong.');
  }
});

client.login(process.env.DISCORD_TOKEN);
