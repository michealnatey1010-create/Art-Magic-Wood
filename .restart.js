const cp = require('child_process');
const server = cp.spawn('cmd.exe', ['/c', 'npx next start -p 3001'], { cwd: 'F:\\school libri', stdio: 'inherit' });
process.on('exit', () => server.kill());
