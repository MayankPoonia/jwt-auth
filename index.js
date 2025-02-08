const express = require("express");
const User = require("./models/User");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const authenticateAdmin = require("./middlewares/authenticateAdmin");
const authenticateToken = require("./middlewares/authenticateToken");

const connectToDB = require("./db");
connectToDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authenticateToken);

app.get("/posts", (req, res) => {
  const user = req.user.email;
  res.status(200).json({ message: "Helllo baby , this is Main server...." });
});

app.get("/dashboard", authenticateAdmin, (req, res) => {
  return res
    .status(200)
    .json({ message: `Hello admin : ${req.user.username}` });
});

// app.listen(8080, () => {
//   console.log(`⚙️ Main Server running on port 8080....`);
// });

module.exports = app;
