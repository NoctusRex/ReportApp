// src/set-env.js

// Use require() for CommonJS modules
const path = require('path');
const fs = require('fs-extra'); // Make sure fs-extra is installed: npm install fs-extra

// You can uncomment and use the 'colors' library if you install it (npm install colors)
// const colors = require('colors');

const targetPath = path.join(__dirname, 'environments', 'environment.prod.ts');
console.log('Generating environment.prod.ts...'); // You can add colors.cyan() here if 'colors' is used

// **CRITICAL FIXES:**
// 1. Using standard single quotes (') instead of backticks (`′`) for string interpolation.
// 2. Accessing environment variables using dot notation (e.g., process.env.FIREBASE_API_KEY)
//    and assuming they are uppercase in Vercel (e.g., FIREBASE_API_KEY, not firebase_apiKey).
const envConfigFile = `export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.firebase_apiKey}',
    authDomain: '${process.env.firebase_authDomain}',
    projectId: '${process.env.firebase_projectId}',
    storageBucket: '${process.env.firebase_storageBucket}',
    messagingSenderId: '${process.env.firebase_messagingSenderId}',
    appId: '${process.env.firebase_appId}',
    measurementId: '${process.env.firebase_measurementId}'
  }
};
`;

try {
  fs.writeFileSync(targetPath, envConfigFile);
  console.log(`The file 'environment.prod.ts' has been written successfully to ${targetPath}`); // Add colors.magenta() here if 'colors' is used
} catch (error) {
  console.error("Error writing environment.prod.ts:", error); // Add colors.red() here if 'colors' is used
  process.exit(1); // Exit with an error code if creation fails
}
