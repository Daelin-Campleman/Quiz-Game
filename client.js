function createGame() {
    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", (event) => {
        socket.send("CREATE");
    });

    socket.addEventListener("message", (msg) => console.log(msg.data));
}