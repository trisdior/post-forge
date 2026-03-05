# ✨ Aura Check

A viral web app that reads your "aura" from a selfie and generates beautiful, shareable energy cards.

![Aura Check Preview](https://via.placeholder.com/800x400/0a0a0f/8b5cf6?text=✨+Discover+Your+Aura)

## Features

- 🖼️ **Upload a selfie** — Drag & drop or click to upload
- 🔮 **AI Aura Reading** — Get your unique aura color, personality type, and energy levels
- 📊 **Energy Bars** — See your creativity, confidence, intuition, passion, wisdom, and calm
- 💫 **Personality Types** — 24 unique archetypes (The Visionary, The Healer, etc.)
- 🎨 **Beautiful Cards** — Instagram-ready gradient cards with glassmorphism
- 📱 **Mobile-first** — Looks stunning on phones
- 📤 **Share Button** — Download your aura card as an image

## Tech Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **html2canvas** — Screenshot generation

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
aura-check/
├── app/
│   ├── components/
│   │   ├── AnalyzingScreen.tsx  # Loading animation
│   │   ├── EmailCapture.tsx     # Coming soon CTA
│   │   ├── EnergyBar.tsx        # Animated progress bar
│   │   ├── LandingSection.tsx   # Hero section
│   │   ├── ParticleBackground.tsx
│   │   ├── ResultsCard.tsx      # Main results display
│   │   ├── ShareButton.tsx      # Download & share
│   │   └── UploadSection.tsx    # File upload
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── auraGenerator.ts         # Fake AI logic
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## How It Works

Since this is a prototype without a real AI backend, the app uses a deterministic hash-based system:

1. User uploads a photo
2. Filename + timestamp creates a unique seed
3. Seed generates consistent "aura reading":
   - Aura color (9 options with meanings)
   - Personality type (24 archetypes)
   - Energy levels (6 categories, 40-95% range)
   - Compatible aura colors
   - Vibe sentence (20+ mystical one-liners)

This ensures the same photo gives the same reading, but different photos give different results.

## Customization

### Aura Colors
Edit `lib/auraGenerator.ts` to modify colors:
- Purple → Intuition
- Cyan → Calm
- Gold → Wisdom
- Pink → Love
- Blue → Peace
- Green → Healing
- Red → Passion
- Orange → Creativity
- White → Purity

### Personality Types
24 built-in types. Add more in the `PERSONALITY_TYPES` array.

### Vibe Sentences
Add mystical one-liners in the `VIBE_SENTENCES` array.

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Other Platforms
Build and deploy the `.next` folder:
```bash
npm run build
npm start
```

## Future Ideas

- [ ] Real AI vision integration (GPT-4V, Claude Vision)
- [ ] Save readings to account
- [ ] Daily personalized readings
- [ ] Compatibility checker with friends
- [ ] Social sharing integrations
- [ ] Print-ready cards

## License

MIT — Do whatever you want with it ✨

---

Made with cosmic energy 🌙
