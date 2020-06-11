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

let players = [];
io.on("connection", (socket) => {
  socket.on(`unlock`, (msg) => {
    console.log("🔓");
    io.emit(`unlockButton`);
  });

  socket.on(`playerJoined`, (player) => {
    console.log("A played connected 🤽‍♀️ :" + player);
    players.push(player);
    io.emit(`updatePlayers`, players);
  });
});

http.listen(8080, () => {
  console.log("👂 on *:8080 🚀 🚀 🚀");
});
