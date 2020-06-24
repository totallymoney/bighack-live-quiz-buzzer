var express = require("express");
var router = express.Router();

router.get("/admin", (req, res) => {
  res.render("admin", { title: "Hey", message: "Hello there!" });
});

router.get("/", (req, res) => {
  res.render("index", { title: "Hey", message: "Hello there!" });
});

module.exports = router;
