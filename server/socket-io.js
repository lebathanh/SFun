const http = require("http");
const { Server } = require("socket.io");

const UserModel = require("./models/userModel");
const NotifiModel = require("./models/notificationModel");

const app = require("./index");
const server = http.createServer(app);
const io = new Server(server, {
  allowEIO3: true,
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// middelware

io.use((socket, next) => {
  const _id = socket.handshake.query._id;
  socket.userId = _id;
  next();
});

io.on("connection", function (socket) {
  (() => {
    UserModel.findById(socket.userId).then((data) => {
      data.online = true;
      data.save();
      socket.broadcast.emit("newconnection", data._id);
    });
  })();

  // send message
  socket.on("user_send-mess", (data) => {
    socket.broadcast.emit(`srv_send-mess-${data.friend}`, data);
  });

  // writing
  socket.on("user_writing", (data) => {
    socket.broadcast.emit(`srv_writing`, data);
  });
  socket.on("user_unwriting", (data) => {
    socket.broadcast.emit(`srv_unwriting`, data);
  });

  // commenting
  socket.on("user_commenting", (data) => {
    socket.broadcast.emit(`srv_commenting-${data}`);
  });

  socket.on("user_uncommenting", (data) => {
    socket.broadcast.emit(`srv_uncommenting-${data}`);
  });

  // commented
  socket.on("user_commented", (data) => {
    socket.broadcast.emit(`srv_commented-${data.post}`, data);
  });

  // new post
  socket.on("user_newpost", (data) => {
    (async () => {
      const foundNotifi = await NotifiModel.findById(data).populate([
        {
          path: "author",
        },
        {
          path: "post",
          populate: [
            {
              path: "group",
            },
          ],
        },
      ]);
      if (foundNotifi) {
        foundNotifi.receivers.forEach((element) => {
          socket.broadcast.emit(`srv_newpost-${element}`, foundNotifi);
        });
      }
    })();
  });

  socket.on("disconnect", function () {
    (() => {
      UserModel.findById(socket.userId).then((data) => {
        data.online = false;
        data.save();
        socket.broadcast.emit("disconnection", data._id);
      });
    })();
  });
});

server.listen(process.env.PORT || 5000, () => {
  // eslint-disable-next-line no-console
  console.log("Socket listen on port", process.env.PORT || 5000);
});
