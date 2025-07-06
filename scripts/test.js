
document.querySelector('.test').innerHTML = "TEST";

const socket = io("ws://localhost:7000");

socket.on("connect", () => {
  console.log("connected to server");
  //socket.emit("message", "Hello from client!");
  doMySocketRequests(socket);
});

socket.on("message", (data) => {
  console.log("got message from server:", data);
});

/*
socket.on('connect', () => {
  console.log('connected to server');
  socket.emit("getUser", messageToServer, (response) => {
    console.log(response);
  });
});
*/

async function doMySocketRequests(socket) {
  const res1 =
    // socket.emit("message", "Hello from client!");
    await sendSocketRequest(socket, 'message', "Hello from client!");
  //const res2 =
  //  await sendSocketRequest(socket, 'event2', { param: 456 });

  //console.log('Socket requests finished:', res1, res2);
  console.log('Socket requests finished:', res1);
  //continueWithMyCode(res1, res2);
  continueWithMyCode(res1);
}

function sendSocketRequest(socket, event, payload) {
  return new Promise((resolve) => {
    socket.emit(event, payload, (response) => {
      resolve(response);
    });
  });
}

function continueWithMyCode(res1) {

  document.querySelector('.test').innerHTML = res1;
  document.querySelector('.test').innerHTML = "Go'e greier";
}