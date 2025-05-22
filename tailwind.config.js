/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'soft-peach':  '#F9F4EF',
        'pale-beige':  '#F7EDE2',
        'light-brown': '#A67C52',
        'earth-200':   '#F0E5D8',
        'earth-700':   '#5C432E',
        'accent':      '#E7D3C0',
        'accent-hover':'#dcbea7',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        sans:     ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
