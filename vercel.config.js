// vercel.config.js
module.exports = {
  // Specify the build command
  build: {
    env: {
      // Ensure environment variables are available during build
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY
    }
  },
  // Configure headers for proper MIME types
  headers: [
    {
      source: '/(.*)\\.js',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript'
        }
      ]
    },
    {
      source: '/(.*)\\.ts',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript'
        }
      ]
    },
    {
      source: '/(.*)\\.tsx',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript'
        }
      ]
    },
    {
      source: '/(.*)\\.jsx',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript'
        }
      ]
    },
    {
      source: '/(.*)\\.css',
      headers: [
        {
          key: 'Content-Type',
          value: 'text/css'
        }
      ]
    }
  ]
};