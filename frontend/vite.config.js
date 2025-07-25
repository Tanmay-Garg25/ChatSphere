import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",  
  build: {
    outDir: "dist",
    emptyOutDir: true  // Clean the dist folder before building
  }
})


// {
//   "rewrites": [
//     {
//       "source": "/api/(.*)",
//       "destination": "/api/index.vercel.js"
//     },
//     {
//       "source": "/(.*)",
//       "destination": "/"
//     }
//   ]
// }