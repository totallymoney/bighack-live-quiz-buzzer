const app = require("express")();
const http = require("http").createServer(app);
const expressLess = require("express-less");
const io = require("socket.io")(http);
app.use("/less-css", expressLess(__dirname + "/less"));

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/admin.html");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let totalPlayers = 0;
io.on("connection", (socket) => {
  console.log(`a played connected 🤽‍♀️`);
  totalPlayers++;
  socket.on("disconnect", () => {
    totalPlayers--;
    console.log(`a player disconnected`);
  });

  socket.on(`unlock`, (msg) => {
    console.log("🔓");
    io.emit(`unlockButton`);
  });

  io.emit(`playerCount`, {
    totalPlayers,
  });
});

http.listen(3000, () => {
  console.log("👂 on *:3000 🚀 🚀 🚀");
});
