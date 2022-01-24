const socket = io();

// 채팅
const welcome = document.getElementById("welcome");
const roomNo = welcome.querySelector("#roomNo");
const nickForm = welcome.querySelector("#name");
const room = document.getElementById("room");

let chatRoomName;
let nick = "Anon";
let myPeerConnection;

room.hidden = true;

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${chatRoomName}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function changeNickname(nick) {
  const h3 = welcome.querySelector("h3");
  h3.innerText = `Now Your Nickname: ${nick}`;
  const nameForm = welcome.querySelector("#name");
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const msg = input.value;
  socket.emit("new_message", input.value, chatRoomName, () => {
    addMessage(`You: ${msg}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("#name input");
  nick = input.value;
  socket.emit("nickname", nick, changeNickname(nick));
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomNo.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  chatRoomName = input.value;
  input.value = "";
}

nickForm.addEventListener("submit", handleNicknameSubmit);
roomNo.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${chatRoomName} (${newCount})`;
  addMessage(`${user}님이 입장했습니다.`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${chatRoomName} (${newCount})`;
  addMessage(`${left}님이 방에서 나갔습니다.`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

// video
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcomeVideo = document.getElementById("welcomeVideo");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let videoRoomName;

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
// getCameras();

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerHTML = "Unmute";
    muted = true;
  } else {
    muteBtn.innerHTML = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

welcomeVideoForm = welcomeVideo.querySelector("form");

async function startMedia() {
  welcomeVideo.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeVideoSubmit(event) {
  event.preventDefault();
  const input = welcomeVideoForm.querySelector("input");
  socket.emit("join_VideoRoom", input.value, startMedia);
  videoRoomName = input.value;
  input.value = "";
}

welcomeVideoForm.addEventListener("submit", handleWelcomeVideoSubmit);

// 에러 주의
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer...");
  socket.emit("offer", offer, videoRoomName);
});

socket.on("offer", (offer) => {
  console.log(offer);
});

// RTC code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}
