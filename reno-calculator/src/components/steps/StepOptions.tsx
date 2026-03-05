'use client';

import { ProjectType, QualityLevel, ProjectOptions, KitchenOptions, BathroomOptions, FlooringOptions, PaintingOptions } from '@/lib/types';

interface StepOptionsProps {
  projectType: ProjectType | null;
  options: ProjectOptions;
  qualityLevel: QualityLevel | null;
  onUpdate: (options: ProjectOptions) => void;
}

export default function StepOptions({ projectType, options, onUpdate }: StepOptionsProps) {
  if (projectType === 'kitchen') {
    const kitchen: KitchenOptions = options.kitchen || { cabinets: true, countertops: true, backsplash: false, appliances: false, plumbing: false, electrical: false };
    const toggle = (key: keyof KitchenOptions) => onUpdate({ ...options, kitchen: { ...kitchen, [key]: !kitchen[key] } });
    const items = [
      { key: 'cabinets' as const, label: 'Cabinets', desc: 'New or refaced cabinets' },
      { key: 'countertops' as const, label: 'Countertops', desc: 'Granite, quartz, marble, etc.' },
      { key: 'backsplash' as const, label: 'Backsplash', desc: 'Tile or stone backsplash' },
      { key: 'appliances' as const, label: 'Appliances', desc: 'New appliance package' },
      { key: 'plumbing' as const, label: 'Plumbing', desc: 'Sink, faucet, disposal' },
      { key: 'electrical' as const, label: 'Electrical', desc: 'Lighting, outlets, wiring' },
    ];
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">What's Included?</h2>
        <p className="text-gray-400 mb-6">Select what you'd like in your kitchen remodel</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item => (
            <button key={item.key} onClick={() => toggle(item.key)}
              className={`p-4 rounded-xl border text-left transition-all ${kitchen[item.key] ? 'bg-gold/10 border-gold/50 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${kitchen[item.key] ? 'bg-gold border-gold' : 'border-gray-500'}`}>
                  {kitchen[item.key] && <span className="text-black text-xs font-bold">✓</span>}
                </div>
                <div><div className="font-medium text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.desc}</div></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (projectType === 'bathroom') {
    const bathroom: BathroomOptions = options.bathroom || { tubShower: true, vanity: true, tile: false, fixtures: false, plumbing: false };
    const toggle = (key: keyof BathroomOptions) => onUpdate({ ...options, bathroom: { ...bathroom, [key]: !bathroom[key] } });
    const items = [
      { key: 'tubShower' as const, label: 'Tub / Shower', desc: 'New tub, shower, or conversion' },
      { key: 'vanity' as const, label: 'Vanity', desc: 'New vanity and mirror' },
      { key: 'tile' as const, label: 'Tile Work', desc: 'Floor and wall tile' },
      { key: 'fixtures' as const, label: 'Fixtures', desc: 'Faucets, hardware, accessories' },
      { key: 'plumbing' as const, label: 'Plumbing', desc: 'Pipe work and rough-in' },
    ];
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">What's Included?</h2>
        <p className="text-gray-400 mb-6">Select what you'd like in your bathroom remodel</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item => (
            <button key={item.key} onClick={() => toggle(item.key)}
              className={`p-4 rounded-xl border text-left transition-all ${bathroom[item.key] ? 'bg-gold/10 border-gold/50 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${bathroom[item.key] ? 'bg-gold border-gold' : 'border-gray-500'}`}>
                  {bathroom[item.key] && <span className="text-black text-xs font-bold">✓</span>}
                </div>
                <div><div className="font-medium text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.desc}</div></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (projectType === 'flooring') {
    const flooring: FlooringOptions = options.flooring || { materialType: 'lvp', roomCount: 3, sqft: 600 };
    const update = (updates: Partial<FlooringOptions>) => onUpdate({ ...options, flooring: { ...flooring, ...updates } });
    const materials = [
      { value: 'hardwood' as const, label: 'Hardwood', price: '$8-20/sqft' },
      { value: 'tile' as const, label: 'Tile', price: '$10-25/sqft' },
      { value: 'lvp' as const, label: 'Luxury Vinyl (LVP)', price: '$5-12/sqft' },
      { value: 'carpet' as const, label: 'Carpet', price: '$3-8/sqft' },
    ];
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Flooring Details</h2>
        <p className="text-gray-400 mb-6">Select material and area</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {materials.map(m => (
              <button key={m.value} onClick={() => update({ materialType: m.value })}
                className={`p-4 rounded-xl border text-left transition-all ${flooring.materialType === m.value ? 'bg-gold/10 border-gold/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                <div className="text-white font-medium text-sm">{m.label}</div>
                <div className="text-gold text-xs mt-1">{m.price}</div>
              </button>
            ))}
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Approximate square footage</label>
            <input type="number" value={flooring.sqft} onChange={e => update({ sqft: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold" placeholder="e.g. 600" />
          </div>
        </div>
      </div>
    );
  }

  if (projectType === 'painting') {
    const painting: PaintingOptions = options.painting || { type: 'interior', roomCount: 4, prepWork: 'minimal' };
    const update = (updates: Partial<PaintingOptions>) => onUpdate({ ...options, painting: { ...painting, ...updates } });
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Painting Details</h2>
        <p className="text-gray-400 mb-6">Tell us about your painting project</p>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {(['interior', 'exterior', 'both'] as const).map(t => (
              <button key={t} onClick={() => update({ type: t })}
                className={`p-3 rounded-xl border text-center capitalize transition-all ${painting.type === t ? 'bg-gold/10 border-gold/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Number of rooms</label>
            <input type="number" value={painting.roomCount} onChange={e => update({ roomCount: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold" min="1" max="20" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Prep work needed</label>
            <div className="grid grid-cols-3 gap-3">
              {(['minimal', 'moderate', 'extensive'] as const).map(p => (
                <button key={p} onClick={() => update({ prepWork: p })}
                  className={`p-3 rounded-xl border text-center capitalize text-sm transition-all ${painting.prepWork === p ? 'bg-gold/10 border-gold/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default for full-remodel and other
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Project Details</h2>
      <p className="text-gray-400 mb-6">Any additional details about your project are optional. Click Continue to proceed.</p>
      <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
        <p className="text-gold text-lg">✓ We have everything we need</p>
        <p className="text-gray-400 text-sm mt-2">Your estimate will be based on typical {projectType?.replace('-', ' ')} costs in Chicago</p>
      </div>
    </div>
  );
}
