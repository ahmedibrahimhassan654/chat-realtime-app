const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    "mongodb+srv://ahmedibrahimhassan654:eUTJDaUKVm58mm7s@chatapp.za9z2.mongodb.net/?retryWrites=true&w=majority&appName=chatApp";

  if (!mongoURI) {
    console.error("MongoDB URI is missing! Check your environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);

    // Use dynamic import for chalk
    const chalk = await import("chalk");
    console.log(
      chalk.default.yellow.underline.bold(
        `MongoDB Connected: ${conn.connection.host} at uri ${mongoURI} at ${process.env.NODE_ENV} environment`
      )
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
