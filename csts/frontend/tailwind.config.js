
/** @type {import('tailwindcss').Config} */
// This comment provides type information for VS Code's IntelliSense.

// Export the configuration object for Tailwind CSS.
export default {
  // An array of file paths where Tailwind should look for classes to generate CSS.
  content: [
    // Include the main index.html file.
    "./index.html",
    // Include all JavaScript, TypeScript, JSX, and TSX files in the src directory and its subdirectories.
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // The theme section is where you define your project's color palette, typography, spacing, etc.
  theme: {
    // The extend section allows you to add new values to Tailwind's default theme without overriding them.
    extend: {
      // Extend the default font families.
      fontFamily: {
        // Set 'Poppins' as the default sans-serif font for the project.
        sans: ['Poppins', 'sans-serif'],
      },
      // Extend the default color palette.
      colors: {
        // Define a custom primary brand color.
        'brand-primary': '#191F6C', // New Horizons navy
        // Define a custom secondary brand color.
        'brand-secondary': '#ED7422', // New Horizons orange
        // Define a custom accent brand color.
        'brand-accent': '#79ADD3', // New Horizons sky blue
        // Define a custom light brand color.
        'brand-light': '#F0F4FA',
        // Define a custom 'slate' color palette with multiple shades.
        'slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      }
    },
  },
  // The plugins section is where you can add official or third-party Tailwind plugins.
  plugins: [],
}
