const path = require('path');
const { exec } = require('child_process');

const gulpConfig = path.resolve(__dirname, './compiler.js');

async function run() {
  const p = exec(`npx gulp -f ${gulpConfig} buildExample --color`);
  p.stdout.on('data', (stdout) => console.info(stdout));
  p.stderr.on('data', (stderr) => console.info(stderr));
}

run();