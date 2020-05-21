var users = [];

// add user
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const found = users.find((user) => {
    return user.username === username && user.room === room;
  });

  if (!found) {
    const newUser = {
      id,
      username,
      room,
    };

    users.push(newUser);
    return { user: newUser };
  } else {
    return { error: "Username is in use" };
  }
};

// remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

// get user
const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });

  if (!user) {
    return {
      error: "No such user found",
    };
  }

  return user;
};

// get user in room
const getUserR = (room) => {
  room = room.trim().toLowerCase();
  const user = users.filter((user) => {
    return user.room === room;
  });

  console.log(user);

  return user;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserR,
};

// addUser({
//   username: "Bhavyaa",
//   id: 1,
//   room: "hey",
// });
// console.log(users);
// console.log(getUser(1));
// console.log(getUserR(1, "hey"));
