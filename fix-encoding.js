const fs = require('fs');
let content = fs.readFileSync('C:/Users/trisd/clawd/valencia-kitchen-remodel-page.html', 'utf8');

// Extract the style+body content
const styleStart = content.indexOf('<style>');
const bodyEnd = content.indexOf('</body>');
let extracted = content.substring(styleStart, bodyEnd);

// Replace emojis with HTML entities
const replacements = [
  ['\u{1F4DE}', '&#128222;'],    // 📞
  ['\u{1F6E1}\uFE0F', '&#128737;&#65039;'],  // 🛡️
  ['\u{1F6E1}', '&#128737;'],    // 🛡 without variation selector
  ['\u{1F4AC}', '&#128172;'],    // 💬
  ['\u{1F4CB}', '&#128203;'],    // 📋
  ['\u23F1\uFE0F', '&#9201;&#65039;'],  // ⏱️
  ['\u23F1', '&#9201;'],         // ⏱ without variation selector
  ['\u{1F464}', '&#128100;'],    // 👤
  ['\u{1F4B0}', '&#128176;'],    // 💰
  ['\u26A1', '&#9889;'],         // ⚡
  ['\u{1F4F1}', '&#128241;'],    // 📱
  ['\u{1F3C6}', '&#127942;'],    // 🏆
  ['\u{1F9F9}', '&#129529;'],    // 🧹
  ['\u2605', '&#9733;'],         // ★
  ['\u2713', '&#10003;'],        // ✓
  ['\u2014', '&mdash;'],         // —
  ['\u2714', '&#10004;'],        // ✔
];

for (const [from, to] of replacements) {
  extracted = extracted.split(from).join(to);
}

// Fix CSS content properties that use Unicode chars
extracted = extracted.replace(/content: '✓'/g, "content: '\\2713'");
extracted = extracted.replace(/content: '✔'/g, "content: '\\2714'");

console.log('Length:', extracted.length);
console.log('Has any emoji left:', /[\u{1F000}-\u{1FFFF}]/u.test(extracted));
console.log('Has em dash left:', extracted.includes('\u2014'));
console.log('Has checkmark left:', extracted.includes('\u2713'));

// Check a known area
const phoneIdx = extracted.indexOf('(773) 682-7788');
if (phoneIdx > 0) {
  console.log('Phone area:', extracted.substring(phoneIdx - 20, phoneIdx + 20));
}

const emIdx = extracted.indexOf('not a salesperson');
if (emIdx > 0) {
  console.log('Em dash area:', extracted.substring(emIdx - 30, emIdx + 20));
}

fs.writeFileSync('C:/Users/trisd/clawd/valencia-kitchen-wp-entities.html', extracted, 'utf8');
console.log('Written entity-encoded file');
