export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg:          '#FFFFFF',
        surface:     '#F8FAFC',
        border:      '#E2E8F0',
        t1:          '#0F172A',
        t2:          '#475569',
        t3:          '#94A3B8',
        accent:      '#D4522A',
        'accent-soft': '#FBF0EC',
      },
    },
  },
  plugins: [],
}
