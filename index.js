const app = require("express")();
const http = require("http").createServer(app);
const expressLess = require("express-less");
app.use("/less-css", expressLess(__dirname + "/less"));

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

http.listen(3000, () => {
  console.log("👂 on *:3000 🚀🚀🚀🚀🚀🚀🚀");
});
