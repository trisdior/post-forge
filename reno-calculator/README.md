# Valencia Construction - Renovation Calculator

A professional lead generation tool for Valencia Construction Chicago. Homeowners enter their project details and receive instant cost estimates, then are prompted to get a real quote.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Lucide React** for icons

## Features

- ✅ Beautiful landing page with Valencia Construction branding
- ✅ 6-step multi-step calculator form
- ✅ Project types: Kitchen, Bathroom, Flooring, Painting, Full Remodel, Other
- ✅ Room size selection with project-specific descriptions
- ✅ Quality level selection (Budget, Mid-Range, Premium)
- ✅ Project-specific options (cabinets, countertops, materials, etc.)
- ✅ Timeline selection
- ✅ Chicago area zip code validation
- ✅ Beautiful results page with cost breakdown
- ✅ Visual cost range bar
- ✅ Timeline estimates
- ✅ Money-saving tips
- ✅ Lead capture form
- ✅ API route to save leads to JSON

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at [http://localhost:3002](http://localhost:3002)

## Project Structure

```
reno-calculator/
├── src/
│   ├── app/
│   │   ├── api/leads/route.ts    # API route for lead capture
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout with header/footer
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── Calculator.tsx        # Main calculator component
│   │   ├── ResultsPage.tsx       # Results & lead capture
│   │   └── steps/                # Step components
│   │       ├── StepProjectType.tsx
│   │       ├── StepRoomSize.tsx
│   │       ├── StepQuality.tsx
│   │       ├── StepOptions.tsx
│   │       ├── StepTimeline.tsx
│   │       └── StepZipCode.tsx
│   └── lib/
│       ├── types.ts              # TypeScript types
│       └── pricing.ts            # Pricing calculations
├── data/
│   └── leads.json                # Captured leads (auto-created)
└── package.json
```

## Pricing Data

Based on 2026 Chicago market rates:

| Project Type | Budget | Mid-Range | Premium |
|--------------|--------|-----------|---------|
| Kitchen Remodel | $8-15K | $15-35K | $35-75K+ |
| Bathroom Remodel | $5-10K | $10-25K | $25-50K+ |
| Flooring (per sq ft) | $3-25 | varies by material | |
| Painting (per room) | $200-500 | $400-800 | $600-1,500 |
| Full Home Remodel | $30-60K | $60-150K | $150-300K+ |

## API Endpoints

### POST /api/leads
Save a new lead.

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "projectType": "string",
  "roomSize": "string",
  "qualityLevel": "string",
  "estimate": { ... },
  "zipCode": "string",
  "timeline": "string"
}
```

### GET /api/leads
Retrieve all captured leads (for admin use).

## Branding

- **Primary Color**: Gold (#fbbf24)
- **Background**: Black (#0a0a0a)
- **Font**: Inter
- **Phone**: (773) 682-7788
- **Website**: valenciaconstructionchi.com

## Lead Data

Leads are saved to `data/leads.json`. This file is gitignored to protect customer PII.

## Deployment

For production, consider:
1. Setting up a proper database instead of JSON file
2. Adding email notifications for new leads
3. Setting up analytics tracking
4. Adding form validation with Zod
5. Implementing rate limiting on the API

## License

Private - Valencia Construction Chicago
