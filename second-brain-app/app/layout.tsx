import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2nd Brain — Valencia HQ",
  description: "Your AI-powered knowledge base",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-2 shrink-0">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-amber-400">🧠 2nd Brain</h1>
              <p className="text-xs text-zinc-500 mt-1">Valencia Construction HQ</p>
            </div>
            <NavLink href="/" label="📊 Dashboard" />
            <NavLink href="/ideas" label="💡 Ideas & Projects" />
            <NavLink href="/memories" label="🧠 Memories" />
            <NavLink href="/documents" label="📄 Documents" />
            <NavLink href="/tasks" label="✅ Tasks" />
            <NavLink href="/notes" label="📝 Quick Notes" />
            <NavLink href="/fleet" label="🚀 Model Fleet" />
            <div className="mt-auto pt-6 border-t border-zinc-800">
              <p className="text-xs text-zinc-600">Powered by Steve 🔧</p>
            </div>
          </nav>
          {/* Main */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
    >
      {label}
    </a>
  );
}
