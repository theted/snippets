module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [
    // require('@tailwindcss/custom-forms'),
    // require('@tailwindcss/typography'),
  ],
};
