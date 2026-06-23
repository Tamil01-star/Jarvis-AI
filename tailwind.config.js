/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#05070f',
          panel: 'rgba(6, 10, 26, 0.65)',
          cyan: '#00f0ff',
          blue: '#0066ff',
          orange: '#ff5d00',
          purple: '#9d00ff',
          green: '#00ff66',
          red: '#ff0055',
          border: 'rgba(0, 240, 255, 0.15)',
          borderHover: 'rgba(0, 240, 255, 0.4)',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        sharetech: ['"Share Tech Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)',
        'neon-cyan-strong': '0 0 15px rgba(0, 240, 255, 0.6), 0 0 30px rgba(0, 240, 255, 0.3)',
        'neon-blue': '0 0 10px rgba(0, 102, 255, 0.3), 0 0 20px rgba(0, 102, 255, 0.1)',
        'neon-orange': '0 0 10px rgba(255, 93, 0, 0.3), 0 0 20px rgba(255, 93, 0, 0.1)',
        'neon-green': '0 0 10px rgba(0, 255, 102, 0.3), 0 0 20px rgba(0, 255, 102, 0.1)',
        'neon-red': '0 0 10px rgba(255, 0, 85, 0.3), 0 0 20px rgba(255, 0, 85, 0.1)',
        'hologram': 'inset 0 0 20px rgba(0, 240, 255, 0.15), 0 0 10px rgba(0, 240, 255, 0.05)',
      },
      animation: {
        'scan': 'scan 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-clockwise': 'orbit-cw 20s linear infinite',
        'orbit-counter': 'orbit-ccw 25s linear infinite',
        'grid-scroll': 'grid-scroll 20s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'sound-wave': 'sound-wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        'orbit-cw': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'orbit-ccw': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        'grid-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' }
        },
        blink: {
          '50%': { opacity: '0' }
        },
        'sound-wave': {
          '0%': { height: '4px' },
          '100%': { height: '32px' }
        }
      }
    },
  },
  plugins: [],
}
