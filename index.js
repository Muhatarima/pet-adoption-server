const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuqwjlp.mongodb.net/?appName=Cluster0`;

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Pet Adoption Server Running");
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
