const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Path to the Webpack Dev Server configuration file
const webpackConfigPath = path.resolve(
  __dirname,
  'node_modules',
  'react-scripts',
  'config',
  'webpackDevServer.config.js'
);

// Read the Webpack Dev Server configuration file
fs.readFile(webpackConfigPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading Webpack config:', err);
    return;
  }

  // Modify the configuration to set allowedHosts
  const modifiedData = data.replace(
    /allowedHosts: \[\]/,
    'allowedHosts: ["localhost", "discover-music-1.onrender.com"]'
  );

  // Write the modified configuration back to the file
  fs.writeFile(webpackConfigPath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing Webpack config:', err);
    } else {
      console.log('Webpack Dev Server config updated successfully.');

      // Use cross-env to set the environment variable in a cross-platform way
      const startCommand = process.platform === 'win32'
        ? 'set PORT=3001 && react-scripts start'
        : 'PORT=3001 react-scripts start';

      // Start the development server
      exec(startCommand, (err, stdout, stderr) => {
        if (err) {
          console.error('Error starting dev server:', err);
        }
        console.log(stdout);
        console.error(stderr);
      });
    }
  });
});
