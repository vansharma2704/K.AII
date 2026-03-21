const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected to TEST server');
    ws.on('message', (msg) => console.log('Message:', msg.toString()));
});

console.log('TEST server running on port 8080');
