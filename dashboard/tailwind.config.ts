import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0a0a0a',
          900: '#0f0f1e',
          800: '#1a1a2e',
          700: '#25254a',
          600: '#30305f',
        },
        neon: {
          green: '#00ff41',
          cyan: '#00d4ff',
          blue: '#0077ff',
          orange: '#ff9500',
          red: '#ff3333',
          pink: '#ff006e',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 65, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-orange': '0 0 20px rgba(255, 149, 0, 0.3)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.1)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
export default config
