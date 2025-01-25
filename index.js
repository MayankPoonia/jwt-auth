const express = require("express");
const User = require("./models/User");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const connectToDB = require("./db");
connectToDB();

const app = express();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ message: "No token found" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Access Forbidden" });
    req.user = user;
    next();
  });
};

const authenticateAdmin = async (req, res, next) => {
  const email = req.user.email;
  const userFound = await User.findOne({ email });
  if (!userFound) {
    return res.status(404).json({ message: "No admin found for that email" });
  }
  const isAdmin = userFound.role === "admin";
  if (!isAdmin) {
    return res
      .status(403)
      .json({ message: "You are not admin , you cant access this page" });
  }
  next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/posts", authenticateToken, (req, res) => {
  const user = req.user.email;
  res.status(200).json({ message: "Helllo baby , this is Main server...." });
});

app.get("/dashboard", authenticateToken, authenticateAdmin, (req, res) => {
  return res
    .status(200)
    .json({ message: `Hello admin : ${req.user.username}` });
});

app.listen(8080, () => {
  console.log(`⚙️ Main Server running on port 8080....`);
});
