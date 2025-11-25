import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
        },
        google: {
          blue: '#4285f4',
          red: '#ea4335',
          yellow: '#fbbc04',
          green: '#34a853',
        },
      },
      boxShadow: {
        'google': '0 1px 6px 0 rgba(32,33,36,0.28)',
        'google-hover': '0 2px 8px 0 rgba(32,33,36,0.28)',
        'google-lg': '0 2px 10px 0 rgba(32,33,36,0.28)',
      },
    },
  },
  plugins: [],
}
export default config
