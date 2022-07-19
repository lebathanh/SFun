const usersRoutes = require("./users");
const postRoutes = require("./posts");
const commentRoutes = require("./comment");
const notifiRoutes = require("./notifi");
const groupRoutes = require("./group");
const chatRoutes = require("./chat");

function routes(app) {
  app.use("/api/auth", usersRoutes);
  app.use("/api/post", postRoutes);
  app.use("/api/notifi", notifiRoutes);
  app.use("/api/comment", commentRoutes);
  app.use("/api/group", groupRoutes);
  app.use("/api/chat", chatRoutes);
}

module.exports = routes;
