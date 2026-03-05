#!/usr/bin/env node
/**
 * CVE Live Dashboard — Christopher Valencia Enterprises
 * Real-time view of agent activity
 * Access from phone: http://<your-ip>:3003
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3003;

const DATA_DIR = path.join(__dirname, 'data');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch { return fallback; }
}

// API
app.get('/api/opportunities', (req, res) => res.json(readJSON('opportunities.json', [])));
app.get('/api/analyzed', (req, res) => res.json(readJSON('analyzed.json', [])));
app.get('/api/build-queue', (req, res) => res.json(readJSON('build-queue.json', [])));
app.get('/api/pipeline-log', (req, res) => res.json(readJSON('pipeline-log.json', [])));
app.get('/api/specs', (req, res) => res.json(readJSON('build-specs.json', [])));
app.get('/api/launches', (req, res) => res.json(readJSON('launch-log.json', [])));
app.get('/api/revenue', (req, res) => res.json(readJSON('revenue.json', { total_mrr: 0, target_mrr: 1000000 })));
app.get('/api/stats', (req, res) => {
  const opps = readJSON('opportunities.json', []);
  const analyzed = readJSON('analyzed.json', []);
  const buildQueue = readJSON('build-queue.json', []);
  const specs = readJSON('build-specs.json', []);
  const builds = readJSON('build-log.json', []);
  const launches = readJSON('launch-log.json', []);
  const revenue = readJSON('revenue.json', { total_mrr: 0, target_mrr: 1000000 });
  const logs = readJSON('pipeline-log.json', []);
  res.json({
    total_opportunities: opps.length,
    total_analyzed: analyzed.length,
    build_queue: buildQueue.length,
    specs_ready: specs.length,
    projects_built: builds.length,
    launches_ready: launches.length,
    current_mrr: revenue.total_mrr || 0,
    target_mrr: revenue.target_mrr || 1000000,
    pipeline_runs: logs.length,
    last_run: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
    agents: [
      { name: 'Scout', status: 'active', task: 'Found ' + opps.length + ' opportunities across Reddit + HN' },
      { name: 'Analyst', status: 'active', task: 'Scored ' + analyzed.length + ' opportunities (' + buildQueue.length + ' BUILD)' },
      { name: 'Architect', status: 'active', task: 'Created ' + specs.length + ' build specs' },
      { name: 'Builder', status: 'active', task: 'Built ' + builds.length + ' projects' },
      { name: 'Launcher', status: 'active', task: launches.length + ' launch packages ready' },
    ]
  });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CVE — Live Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e17; color: #e0e0e0; padding: 16px; }
    h1 { font-size: 20px; color: #fff; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
    h2 { font-size: 14px; color: #ffd700; text-transform: uppercase; margin: 16px 0 10px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .stat-card { background: #1a1f3a; border: 1px solid #2d3561; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-number { font-size: 28px; font-weight: 700; color: #ffd700; }
    .stat-label { font-size: 11px; color: #888; margin-top: 4px; }
    .card { background: #1a1f3a; border: 1px solid #2d3561; border-radius: 8px; padding: 14px; margin-bottom: 8px; }
    .agent-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #2d3561; }
    .agent-row:last-child { border-bottom: none; }
    .agent-name { font-weight: 600; color: #fff; }
    .agent-task { font-size: 12px; color: #888; }
    .status-active { color: #00ff00; font-size: 12px; font-weight: 600; }
    .status-standby { color: #ffd700; font-size: 12px; font-weight: 600; }
    .opp-row { padding: 10px 0; border-bottom: 1px solid #1a1f3a; }
    .opp-row:last-child { border-bottom: none; }
    .opp-title { font-weight: 600; color: #fff; font-size: 14px; }
    .opp-meta { font-size: 11px; color: #888; margin-top: 4px; }
    .opp-score { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
    .score-build { background: #00ff00; color: #000; }
    .score-watch { background: #ffd700; color: #000; }
    .score-skip { background: #444; color: #888; }
    .refresh-btn { background: #ffd700; color: #000; border: none; padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px; margin-top: 16px; }
    .live-dot { display: inline-block; width: 8px; height: 8px; background: #00ff00; border-radius: 50%; margin-right: 6px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .timestamp { color: #444; font-size: 11px; margin-top: 8px; text-align: center; }
  </style>
</head>
<body>
  <h1>Christopher Valencia Enterprises</h1>
  <div class="subtitle"><span class="live-dot"></span>Live Agent Dashboard</div>

  <div class="card" style="text-align:center;margin-bottom:16px;">
    <div style="font-size:11px;color:#888;text-transform:uppercase;">Revenue Progress</div>
    <div style="font-size:32px;font-weight:700;color:#00ff00;" id="s-mrr">$0</div>
    <div style="font-size:11px;color:#666;">of $1,000,000 MRR target</div>
    <div style="background:#1a1f3a;border-radius:4px;height:8px;margin-top:8px;overflow:hidden;">
      <div id="mrr-bar" style="background:#ffd700;height:100%;width:0%;transition:width 0.5s;"></div>
    </div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number" id="s-opps">0</div>
      <div class="stat-label">Opportunities</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="s-built">0</div>
      <div class="stat-label">Projects Built</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="s-launches">0</div>
      <div class="stat-label">Launch Ready</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="s-runs">0</div>
      <div class="stat-label">Pipeline Runs</div>
    </div>
  </div>

  <h2>Agent Status</h2>
  <div class="card" id="agents"></div>

  <h2>Top Opportunities</h2>
  <div class="card" id="opportunities"></div>

  <h2>Build Queue</h2>
  <div class="card" id="build-queue"></div>

  <button class="refresh-btn" onclick="refresh()">Refresh</button>
  <div class="timestamp" id="ts"></div>

  <script>
    async function refresh() {
      try {
        const [stats, analyzed, buildQueue] = await Promise.all([
          fetch('/api/stats').then(r => r.json()),
          fetch('/api/analyzed').then(r => r.json()),
          fetch('/api/build-queue').then(r => r.json()),
        ]);

        document.getElementById('s-opps').textContent = stats.total_opportunities;
        document.getElementById('s-built').textContent = stats.projects_built;
        document.getElementById('s-launches').textContent = stats.launches_ready;
        document.getElementById('s-runs').textContent = stats.pipeline_runs;
        document.getElementById('s-mrr').textContent = '$' + (stats.current_mrr || 0).toLocaleString();
        document.getElementById('mrr-bar').style.width = Math.min(100, ((stats.current_mrr || 0) / (stats.target_mrr || 1000000)) * 100) + '%';

        var agentsHTML = '';
        stats.agents.forEach(function(a) {
          var statusClass = a.status === 'active' ? 'status-active' : 'status-standby';
          agentsHTML += '<div class="agent-row"><div><div class="agent-name">' + a.name + '</div><div class="agent-task">' + a.task + '</div></div><span class="' + statusClass + '">' + a.status.toUpperCase() + '</span></div>';
        });
        document.getElementById('agents').innerHTML = agentsHTML;

        var sorted = analyzed.sort(function(a, b) { return (b.overall_score || 0) - (a.overall_score || 0); });
        var oppsHTML = '';
        sorted.slice(0, 10).forEach(function(o) {
          var scoreClass = o.recommendation === 'BUILD' ? 'score-build' : o.recommendation === 'WATCH' ? 'score-watch' : 'score-skip';
          oppsHTML += '<div class="opp-row"><div class="opp-title">' + o.title + '</div><div class="opp-meta">' + o.source + ' | Score: ' + o.overall_score + ' | <span class="opp-score ' + scoreClass + '">' + o.recommendation + '</span></div></div>';
        });
        document.getElementById('opportunities').innerHTML = oppsHTML || '<div class="opp-row"><div class="agent-task">No opportunities scanned yet. Pipeline running...</div></div>';

        var queueHTML = '';
        buildQueue.forEach(function(b) {
          queueHTML += '<div class="opp-row"><div class="opp-title">' + b.title + '</div><div class="opp-meta">Score: ' + b.overall_score + ' | Ready to build</div></div>';
        });
        document.getElementById('build-queue').innerHTML = queueHTML || '<div class="opp-row"><div class="agent-task">No build candidates yet.</div></div>';

        document.getElementById('ts').textContent = 'Updated: ' + new Date().toLocaleTimeString();
      } catch(e) { console.error(e); }
    }
    refresh();
    setInterval(refresh, 15000);
  </script>
</body>
</html>`);
});

app.listen(PORT, function() {
  var ip = getLocalIP();
  console.log('');
  console.log('==================================================');
  console.log('  CVE Live Dashboard');
  console.log('  Christopher Valencia Enterprises');
  console.log('==================================================');
  console.log('  Desktop: http://localhost:' + PORT);
  console.log('  Phone:   http://' + ip + ':' + PORT);
  console.log('==================================================');
});
