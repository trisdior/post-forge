'use client';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#222] px-4 sm:px-6 py-4">
        <div className="ml-10 lg:ml-0">
          <h1 className="text-lg font-semibold text-[#D4A017]">⚙️ Settings</h1>
        </div>
      </header>
      <div className="p-6 max-w-2xl">
        <div className="bg-[#161616] border border-[#222] rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium text-[#888]">Configuration</h2>
          <div className="space-y-3 text-sm text-[#666]">
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span>Spreadsheet Path</span>
              <span className="text-[#888] font-mono text-xs">Valencia-Lead-Tracker.xlsx</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span>Outreach Log</span>
              <span className="text-[#888] font-mono text-xs">outreach-log.json</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span>Theme</span>
              <span className="text-[#D4A017]">Black & Gold</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Version</span>
              <span className="text-[#888]">2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
