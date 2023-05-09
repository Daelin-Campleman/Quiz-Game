const {WebSocketServer} = require("ws"); 

const wss = new WebSocketServer({ port: 8080 });


function createGame() {
  let ID = Math.random() * 10;
  console.log(`Created game with ID: ${ID}`);
  return ID;
}

wss.on("connection", (ws) => {
  ws.on('message', function message(data) {
    let ID = createGame();
    ws.send(`${ID}`);
  });
});
