/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gym: {
          black: '#0a0a0a',
          red: '#dc2626',
          'red-hover': '#b91c1c',
          dark: '#1a1a1a',
          gray: '#6b7280',
          white: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
