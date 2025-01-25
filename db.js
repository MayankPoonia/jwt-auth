const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connection succesfull");
  } catch (e) {
    console.log("Error : ", e);
  }
};

module.exports = connectDB;
