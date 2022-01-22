const meesageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const wss = new WebSocket(`ws://${window.location.host}`);

wss.addEventListener("open", () => {
  console.log("Connected to Server !");
});

wss.addEventListener("message", (message) => {
  console.log("New Message: ", message.data);
});

wss.addEventListener("close", () => {
  console.log("DDDDDD");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  wss.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
