const express = require("express");
const hbs = require("hbs");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUserR } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//now what this does is basically integrates socket io with our server
//and now we can listen to any custom or core event on this server

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates/views"));

hbs.registerPartials(path.join(__dirname, "../templates/partials"));

let count = 0;

// first things first io is our main server that will help us
// communicate with and within all sockets

// if any socket or client leaves or enters this will be known to io
// because io is the one or the server every socket will connect to
// so this line means if there is a new connect to the server

io.on("connection", (socket) => {
  // all the events that are to be listened by the server or to be emitted will go here

  // console.log(generateMessage("Hey"));

  socket.on("join", ({ username, room }, cb) => {
    const { user, error } = addUser({
      username,
      room,
      id: socket.id,
    });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage({ text: `Welcome ${user.username}!`, username: "Admin" })
    );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserR(user.room),
    });

    socket.broadcast.to(user.room).emit(
      "message",
      generateMessage({
        text: `${username} has joined the chat`,
        username: "Admin",
      })
    );

    cb();
  });

  socket.on("sendMessage", (msg, cb) => {
    const user = getUser(socket.conn.id);
    if (user) {
      io.to(user.room).emit("message", { text: msg, username: user.username });
      cb();
    } else {
      cb("Error");
    }
  });

  socket.on("sendLocation", (pos, cb) => {
    const user = getUser(socket.conn.id);

    io.emit(
      "Locationmessage",
      generateMessage({
        text: `https://google.com/maps?q=${pos.lat},${pos.long}`,
        username: user.username,
      })
    );
    cb("Location Shared");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.conn.id);
    if (user) {
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          generateMessage({ text: `${user.username} has left the chat` })
        );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserR(user.room),
      });
    }
  });
});

console.log(count);

server.listen(port, () => {
  console.log("Server has started on port", port);
});
