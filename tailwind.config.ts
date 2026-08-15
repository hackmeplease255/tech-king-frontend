import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        neon: 'var(--neon)',
        'neon-soft': 'var(--neon-soft)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: 'var(--shadow-neon)',
        panel: 'var(--shadow-panel)',
      },
      backgroundImage: {
        'gradient-neon': 'var(--gradient-neon)',
        'gradient-glass': 'var(--gradient-glass)',
      },
    },
  },
  plugins: [],
};

export default config;
