const wss = new WebSocket(`ws://${window.location.host}`);

wss.addEventListener("open", () => {
  console.log("Connected to Server !");
});

wss.addEventListener("message", (message) => {
  console.log("Just got this: ", message, " from the Server");
});

wss.addEventListener("close", () => {
  console.log("DDDDDD");
});
