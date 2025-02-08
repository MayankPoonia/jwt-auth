const express = require("express");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();

const connectToDB = require("./db");
connectToDB();

const app = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "20m",
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
}

app.get("/", (req, res) => {
  res.status(200).json({ message: "Helllo baby , I am Auth Server...." });
});

app.post("/v1/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    return res.status(409).json({ message: "User already exist" });
  }

  const user = {
    username,
    email,
    password,
    role,
  };

  const payload = {
    username,
    email,
    role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  const newUser = new User(user);

  await newUser.save();

  res.status(200).json({
    accessToken,
    refreshToken,
    message: "User registered succesfully",
  });
});

app.post("/v1/login", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    const verified = await bcrypt.compare(password, foundUser.password);
    if (verified) {
      const payload = {
        email,
        username: foundUser.username,
        role: foundUser.role,
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      return res
        .status(200)
        .json({ accessToken, refreshToken, message: "Login succesfull" });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
  } else {
    return res
      .status(404)
      .json({ message: `No user found with email : ${email}` });
  }
});

app.post("/v1/token/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No token found" });
  }
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).json({ message: "No user found or Expired Token" });
  }
  const payload = {
    username: user.username,
    email: user.email,
    role: user.role,
  };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);
  user.accessToken = newAccessToken;
  user.refreshToken = newRefreshToken;
  await user.save();
  return res.status(200).json({
    newAccessToken,
    newRefreshToken,
    message: "Token Refresh Succesfull",
  });
});

app.delete("/v1/logout", async (req, res) => {
  const { refreshToken } = req.body;
  const userFound = await User.findOne({ refreshToken });
  if (!userFound) {
    return res.status(404).json({ message: "No user found or invalid token" });
  }
  userFound.accessToken = null;
  userFound.refreshToken = null;
  await userFound.save();
  return res.status(200).json({ message: "Logout succesfull" });
});

// app.listen(8090, () => {
//   console.log(`⚙️ Auth Server running on port 8090....`);
// });

module.exports = app;
