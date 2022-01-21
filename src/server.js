import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening ~`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// 하나의 서버에서 http 서버, ws 서버 두개의 프로토콜 돌리기

wss.on("connection", (socket) => {
  console.log("Connected to Browser !");
  socket.on("close", () => {
    console.log("Disconnected from the Browser...");
  });
  socket.on("message", (message) => {
    console.log(`New message from Browser: ${message}`);
  });
  socket.send("hello!!!");
});

server.listen(3000, handleListen);
