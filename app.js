const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// app
const app = express();

// db
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Connected to database"))
  .catch((error) => console.error("Error connecting to database", error));

app.get("/", (req, res) => {
  res.send("Hello World Updated!");
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
