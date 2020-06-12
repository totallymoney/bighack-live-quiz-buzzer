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
let unlockTimestamp = 0;

io.on("connection", (socket) => {
  let _pingTimestamp = 0;
  const _id = uuid();
  const _player = {
    name: '',
    latency: 0
  }

  socket.emit('id', _id);

  socket.on("disconnect", () => {
    delete players[_id];
    updatePlayers();
  });

  socket.on('join', (name) => {
    _player.name = name;
    players[_id] = _player;
    _pingTimestamp = Date.now();
    socket.emit('ping', { id: _id, latency: 0 });
    updatePlayers();
  })

  socket.on('pingBack', () => {
    _player.latency = Date.now() - _pingTimestamp;
    setTimeout(() => {
      _pingTimestamp = Date.now();
      socket.emit('ping', { latency: _player.latency });  
    }, 1000);
  })

  socket.on(`unlock`, (msg) => {
    console.log("🔓");
    unlockTimestamp = Date.now();
    playerScores = [];
    io.emit(`unlockButton`);
  });

  socket.on(`buzzed`, (player) => {
    console.log("A player buzzed! ⛑ :" + JSON.stringify(player));

    //playerScores.push(player);
    playerScores.push({
      [_player.name]: Date.now() - unlockTimestamp - _player.latency
    })
    const sortedScores = playerScores.sort((a, b) => a[1] - b[1]);

    io.emit(`updateScores`, sortedScores);
  });
});

http.listen(8080, () => {
  console.log("👂 on *:8080 🚀 🚀 🚀");
});

function updatePlayers() {
  const  playerCount = Object.keys(players).length;
  io.emit(`updatePlayers`, playerCount);
}
