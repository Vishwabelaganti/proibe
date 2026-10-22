const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
// Firebase web configuration is public by design; its provider restrictions still matter.
const firebase = fs.readFileSync('lib/firebase.js', 'utf8').match(/apiKey:\s*"([^"]+)"/)?.[1];
const files = execFileSync('git', ['ls-files', '-z']).toString().split('\0').filter(Boolean);
let failed = false;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file).toString();
  const keys = text.match(/AIza[0-9A-Za-z_-]{35}|sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{25,}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g) || [];
  if (keys.some(key => key !== firebase)) {
    console.error(`Possible private credential in ${file}; value withheld.`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('No private credential patterns found in tracked files.');
