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

function uuid() {
  return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let players = {};
let playerScores = [];
let totalPlayers = 0;

io.on("connection", (socket) => {
  let pingTimestamp = 0;
  totalPlayers++;
  updatePlayers(io, totalPlayers);
  socket.on("disconnect", () => {
    totalPlayers--;
    updatePlayers(io, totalPlayers);
  });

  socket.on('join', (name) => {
    const id = uuid();
    console.log('new id: ', id);
    const player = {
      name: name,
      latency: 0
    }
    players[id] = player;
    socket.emit('id', id);
    pingTimestamp = Date.now();
    socket.emit('ping', 0)
  })

  socket.on('pingBack', (id) => {
    if (players[id]) {
      players[id].latency = Date.now() - pingTimestamp;
      setTimeout(() => {
        pingTimestamp = Date.now();
        socket.emit('ping', players[id].latency);  
      }, 1000);
      console.log('latency ', players[id].latency);
    }
  })

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
