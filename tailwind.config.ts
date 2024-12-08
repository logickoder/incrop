import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import daisyui from 'daisyui';

export default {
  content: ['./pages/**/*.{js,jsx,ts,tsx}', './renderer/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['"Inter"', ...defaultTheme.fontFamily.sans]
    },
    extend: {
      colors: {
        // Custom color palette for image editing app
        'image-primary': {
          50: '#e6f2ff',
          100: '#b3dbff',
          200: '#80c4ff',
          300: '#4dadff',
          400: '#1a96ff',
          500: '#007acc',
          600: '#005c99',
          700: '#004466',
          800: '#002d33',
          900: '#001619'
        },
        'image-accent': {
          50: '#fff0f0',
          100: '#ffc6c6',
          200: '#ff9c9c',
          300: '#ff7272',
          400: '#ff4848',
          500: '#e62020',
          600: '#b30f0f',
          700: '#800000',
          800: '#4d0000',
          900: '#1a0000'
        },
        'image-neutral': {
          50: '#f5f5f5',
          100: '#e6e6e6',
          200: '#d2d2d2',
          300: '#b8b8b8',
          400: '#9e9e9e',
          500: '#757575',
          600: '#545454',
          700: '#333333',
          800: '#1f1f1f',
          900: '#0a0a0a'
        }
      },
      fontFamily: {
        poppins: ['"Poppins"', ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        'checkerboard': 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
        'gradient-radial': 'radial-gradient(var(--gradient-color-stops))'
      },
      boxShadow: {
        'image-soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'image-sharp': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
      },
      animation: {
        'image-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'image-bounce': 'bounce 1s infinite'
      },
      keyframes: {
        'image-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' }
        },
        'image-bounce': {
          '0%, 100%': { transform: 'translateY(-25%)' },
          '50%': { transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#007acc',
          'primary-focus': '#005c99',
          'primary-content': '#ffffff',
          'secondary': '#e62020',
          'secondary-focus': '#b30f0f',
          'secondary-content': '#ffffff',
          'accent': '#1a96ff',
          'accent-focus': '#007acc',
          'accent-content': '#ffffff',
          'neutral': '#333333',
          'neutral-focus': '#1f1f1f',
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',
          'base-200': '#f5f5f5',
          'base-300': '#e6e6e6',
          'base-content': '#0a0a0a'
        },
        dark: {
          'primary': '#007acc',
          'primary-focus': '#005c99',
          'primary-content': '#ffffff',
          'secondary': '#e62020',
          'secondary-focus': '#b30f0f',
          'secondary-content': '#ffffff',
          'accent': '#1a96ff',
          'accent-focus': '#007acc',
          'accent-content': '#ffffff',
          'neutral': '#333333',
          'neutral-focus': '#1f1f1f',
          'neutral-content': '#ffffff',
          'base-100': '#0a0a0a',
          'base-200': '#1f1f1f',
          'base-300': '#333333',
          'base-content': '#ffffff'
        }
      }
    ],
    darkTheme: 'dark', // name of one of the themes
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and colors)
    logs: false // Shows info about daisyUI version and used config in the console
  }
} satisfies Config;