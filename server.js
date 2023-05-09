const {WebSocketServer} = require("ws"); 

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});
