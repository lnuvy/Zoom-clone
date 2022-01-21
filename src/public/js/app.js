const wss = new WebSocket(`ws://${window.location.host}`);

wss.addEventListener("open", () => {
  console.log("Connected to Server !");
});

wss.addEventListener("message", (message) => {
  console.log("New Message: ", message, " from the Server");
});

setTimeout(() => {
  wss.send("hello from the browser!");
}, 5000);

wss.addEventListener("close", () => {
  console.log("DDDDDD");
});
