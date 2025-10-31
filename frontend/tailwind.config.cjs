module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-grey': {
          DEFAULT: '#1E1E1E',
          '50': '#2D2D2D',
          '100': '#282828',
          '200': '#232323',
          '300': '#1E1E1E',
          '400': '#191919',
          '500': '#141414',
        },
        'pastel-green': {
          DEFAULT: '#98D8B1',
          '50': '#FFFFFF',
          '100': '#F5FBF7',
          '200': '#D6EFE0',
          '300': '#B7E3C9',
          '400': '#98D8B1',
          '500': '#6CC891',
          '600': '#44B572',
        },
      },
    }
  },
  plugins: []
}
