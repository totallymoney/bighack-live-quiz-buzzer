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
let totalPlayers = 0;
io.on("connection", (socket) => {
  totalPlayers++;
  updatePlayers(io, totalPlayers);
  socket.on("disconnect", () => {
    totalPlayers--;
    updatePlayers(io, totalPlayers);
  });

  socket.on(`unlock`, (msg) => {
    console.log("🔓");
    playerScores = [];
    io.emit(`unlockButton`);
  });

  socket.on(`buzzed`, (player) => {
    console.log("A player buzzed! ⛑ :" + JSON.stringify(player));

    playerScores.push(player);
    const sortedScores = playerScores.sort((a, b) => a[1] - b[1]);

    io.emit(`updateScores`, sortedScores);
  });
});

http.listen(8080, () => {
  console.log("👂 on *:8080 🚀 🚀 🚀");
});

function updatePlayers(io, players) {
  io.emit(`updatePlayers`, players);
}
