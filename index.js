const app = require("express")();
const http = require("http").createServer(app);
const config = require("./config");
const routes = require("./routes.js");
const io = require("socket.io")(http, {
  path: `${config.baseURL}/socket.io`
});

app.use(config.baseURL, routes);
app.set("view engine", "pug");

function uuid() {
  return "xxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
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
    name: "",
    latency: 0,
  };

  socket.on("disconnect", () => {
    delete players[_id];
    updatePlayers();
  });

  socket.on("join", (name) => {
    _player.name = name;
    players[_id] = _player;
    _pingTimestamp = Date.now();
    socket.emit("ping", { latency: 0 });
    updatePlayers();
  });

  socket.on("pingBack", () => {
    _player.latency = Date.now() - _pingTimestamp;
    setTimeout(() => {
      _pingTimestamp = Date.now();
      socket.emit("ping", { latency: _player.latency });
    }, 1000);
  });

  socket.on(`unlock`, (msg) => {
    console.log("🔓");
    unlockTimestamp = Date.now();
    playerScores = [];
    io.emit(`unlockButton`);
    io.emit(`updateScores`, playerScores);
  });

  socket.on(`buzzed`, () => {
    const buzzEvent = {
      [_player.name]: Date.now() - unlockTimestamp - _player.latency,
    };
    console.log("A player buzzed! ⛑ :" + JSON.stringify(buzzEvent));
    playerScores.push(buzzEvent);
    const sortedScores = playerScores.sort((a, b) => a[1] - b[1]);

    io.emit(`updateScores`, sortedScores);
  });
});

http.listen(8080, () => {
  console.log("👂 on *:8080 🚀 🚀 🚀");
});

function updatePlayers() {
  const playerCount = Object.keys(players).length;
  io.emit(`updatePlayers`, playerCount);
}
