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

let playerScores = [];
io.on("connection", (socket) => {
  socket.on(`unlock`, (msg) => {
    console.log("🔓");
    io.emit(`unlockButton`);
  });

  socket.on(`buzzed`, (player) => {
    console.log("A player buzzed! ⛑ :" + JSON.stringify(player));
    playerScores.push(player);
    io.emit(`updateScores`);
  });
});

http.listen(8080, () => {
  console.log("👂 on *:8080 🚀 🚀 🚀");
});
