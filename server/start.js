const { execSync, spawn } = require('child_process');
const fs = require('fs');

console.log('Starting Vocode Orchestrator...');

try {
    console.log('Installing missing dependencies...');
    execSync('npm install ws axios dotenv tsx --save', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');

    console.log('Starting Vocode Server...');
    const server = spawn('npx', ['tsx', 'server/vocode-server.ts'], {
        stdio: 'inherit',
        shell: true
    });

    server.on('error', (err) => {
        console.error('Failed to start server:', err);
        fs.appendFileSync('server_error.log', err.stack + '\n');
    });

} catch (e) {
    console.error('Orchestration failed:', e);
    fs.writeFileSync('orchestration_error.log', e.stack);
}
