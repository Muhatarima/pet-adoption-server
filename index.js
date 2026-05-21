const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res.send("Pet Adoption Server Running");
});

// server run
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});