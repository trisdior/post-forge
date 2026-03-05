"use client";

const models = [
  {
    icon: "🧠",
    name: "Claude Opus 4.6",
    nickname: '"The Brain"',
    badge: "🏆 FLAGSHIP",
    flagship: true,
    desc: "Primary model for Steve. Handles strategy, estimates, content creation, and business operations. The command center of Valencia.",
    status: "Active",
    cost: 5,
    agent: "🤖 Steve",
  },
  {
    icon: "⚡",
    name: "Claude Sonnet 4.6",
    nickname: '"The Backup"',
    badge: "⚡ FAST",
    flagship: false,
    desc: "Fallback when Opus rate-limits. Fast, capable, and cost-effective. Steps in seamlessly to keep operations running.",
    status: "Standby",
    cost: 3,
    agent: "🤖 Steve (fallback)",
  },
  {
    icon: "🛡️",
    name: "Claude Opus 4.5",
    nickname: '"The Veteran"',
    badge: "🛡️ RELIABLE",
    flagship: false,
    desc: "Secondary fallback with proven reliability. Battle-tested across thousands of sessions. The safety net's safety net.",
    status: "Standby",
    cost: 4,
    agent: "🤖 Steve (fallback)",
  },
  {
    icon: "🔍",
    name: "Gemini 2.5 Flash",
    nickname: '"The Scout"',
    badge: "🔍 SCOUT",
    flagship: false,
    desc: "Powers Hunter, the lead gen agent. Monitors Craigslist, drafts outreach, scores leads. Always scanning for opportunity.",
    status: "Active",
    cost: 2,
    agent: "🎯 Hunter",
  },
  {
    icon: "💾",
    name: "Gemini Embedding 001",
    nickname: '"The Memory"',
    badge: "💾 MEMORY",
    flagship: false,
    desc: "Powers semantic memory search across all agents. Turns conversations into searchable knowledge. The connective tissue.",
    status: "Active",
    cost: 1,
    agent: "🌐 All Agents",
  },
];

function CostDots({ filled }: { filled: number }) {
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= filled ? "bg-amber-500" : "bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

function StatusDot() {
  return (
    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(48,209,88,0.3)] animate-pulse" />
  );
}

export default function FleetPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-4">
          Valencia Operations
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          🧠 Model <span className="text-amber-400">Fleet</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed">
          The AI models powering every layer of the Valencia operation — from
          strategy to memory.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-center gap-12 mb-14 flex-wrap">
        {[
          ["5", "Models Active"],
          ["3", "Agents Powered"],
          ["24/7", "Uptime"],
          ["100%", "Operational"],
        ].map(([value, label]) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold text-amber-400">{value}</div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {models.map((model) => (
          <div
            key={model.name}
            className={`rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${
              model.flagship
                ? "border-amber-500/20 bg-gradient-to-br from-zinc-900 to-[#161208] flagship-glow"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
              <div className="text-4xl">{model.icon}</div>
              <span
                className={`text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full whitespace-nowrap ${
                  model.flagship
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {model.badge}
              </span>
            </div>

            <div className="text-xl font-semibold tracking-tight">
              {model.name}
            </div>
            <div className="text-sm text-amber-500 font-medium mb-3">
              {model.nickname}
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-5">
              {model.desc}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <StatusDot /> {model.status}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                Cost <CostDots filled={model.cost} />
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500">
                {model.agent}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16 pt-8 border-t border-zinc-800">
        <p className="text-sm text-zinc-700">
          <span className="text-amber-500">Valencia Contracting</span> · Mission
          Control · Model Fleet
        </p>
      </div>

      <style jsx>{`
        @keyframes flagship-pulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(212, 168, 67, 0.2),
              inset 0 0 20px rgba(212, 168, 67, 0.03);
          }
          50% {
            box-shadow: 0 0 40px rgba(212, 168, 67, 0.4),
              inset 0 0 40px rgba(212, 168, 67, 0.07);
          }
        }
        .flagship-glow {
          animation: flagship-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
