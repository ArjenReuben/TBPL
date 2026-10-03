
// Import the defineConfig function from Vite, which provides type hints for the config.
import { defineConfig } from 'vite'
// Import the React plugin for Vite, which enables features like Fast Refresh.
import react from '@vitejs/plugin-react'

// Export the Vite configuration object.
// See https://vitejs.dev/config/ for more options.
export default defineConfig({
  // An array of plugins to use.
  plugins: [
    // Add the React plugin.
    react()
  ],
})
