// the client or this new socket can be accessed at the client side like this
// each client is nothing but what is called a socket
const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("msg");
const messages = document.getElementById("chat-messages");
const sendLocation = document.getElementById("sendLocation");
const msgB = document.getElementById("msgB");
const sidebar = document.getElementById("sidebar");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  msgB.setAttribute("disabled", "disabled");
  socket.emit("sendMessage", input.value, (error) => {
    if (!error) {
      // alert("Message delivered!");
    } else {
      alert(error);
    }
  });

  msgB.removeAttribute("disabled");

  input.value = "";
  input.focus();
});

// jo  bhi event socket listen karega that will be emitted by the server
// and after listening jo bhi karega vo usi ki side pe show hoga until
// hum yaha se koi event emit kare ya broadcast kare

const autoscroll = () => {
  var objDiv = document.getElementById("msg-container");
  // objDiv.scrollTop = objDiv.scrollHeight;

  // New message element
  const $newMsg = messages.lastElementChild;
  console.log($newMsg);

  // Height of the new message
  const newMsgStyles = getComputedStyle($newMsg);
  const newMsgMargin = parseInt(newMsgStyles.marginBottom);
  const newMsgHeight = $newMsg.offsetHeight + newMsgMargin;
  console.log(newMsgHeight, newMsgMargin, newMsgStyles);

  // visible height
  const visibleHeight = messages.offsetHeight;
  console.log(visibleHeight);

  // Height of message container
  const containerHeight = messages.scrollHeight;
  console.log(containerHeight);

  // How far have I scrolled?
  const scrollOffset = 2 * (messages.scrollTop + visibleHeight);
  console.log(scrollOffset);

  if (containerHeight - newMsgHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", ({ text, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    msg: text,
    time: moment(createdAt).format("h:mm a"),
    name: username,
  });
  messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("Locationmessage", ({ text, createdAt }) => {
  const html = Mustache.render(locationTemplate, {
    href: text,
    time: moment(createdAt).format("h:mm a"),
    name: username,
  });
  messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

sendLocation.addEventListener("click", (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert("Oops, geolocation is not supported by your browser ");
  }

  sendLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const pos = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    socket.emit("sendLocation", pos, (msg) => {
      alert(msg);
    });
  });

  sendLocation.removeAttribute("disabled");
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    location.href = "/";
    alert(error);
  }
});

socket.on("roomData", ({ room, users }) => {
  // console.log(users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = "";
  sidebar.insertAdjacentHTML("beforeend", html);
});
