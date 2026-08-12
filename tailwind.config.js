/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinematic: ['"Cinzel"', '"Trajan Pro"', 'serif'],
        clean: ['"Inter"', 'sans-serif']
      },
      letterSpacing: {
        widest2: '0.5em'
      }
    }
  },
  plugins: []
}
