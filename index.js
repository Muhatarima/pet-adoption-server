const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion , ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuqwjlp.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Pet Adoption Server Running");
});
async function run() {
  try {
    await client.connect();

    const database = client.db("petAdoptionDB");
    const petsCollection = database.collection("pets");
      const adoptionCollection = database.collection("adoptionRequests");

              
app.get("/pets", async (req, res) => {
  const search = req.query.search || "";
  const species = req.query.species;

  let query = {};

  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (species) {
    const speciesArray = species.split(",");

    query.species = {
      $in: speciesArray,
    };
  }

  const result = await petsCollection.find(query).toArray();

  res.send(result);
});

    app.post("/pets", async (req, res) => {
  const newPet = req.body;

  const result = await petsCollection.insertOne(newPet);

  res.send(result);
});

app.get("/pets/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };

  const result = await petsCollection.findOne(query);

  res.send(result);
});


app.put("/pets/:id", async (req, res) => {
  const id = req.params.id;
  const updatedPet = req.body;

  const filter = { _id: new ObjectId(id) };

  const updateDoc = {
    $set: updatedPet,
  };

  const result = await petsCollection.updateOne(filter, updateDoc);

  res.send(result);
});

        app.delete("/pets/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };

  const result = await petsCollection.deleteOne(query);

  res.send(result);
});
app.post("/adoptions", async (req, res) => {
  const adoptionData = req.body;

  adoptionData.status = "pending";

  adoptionData.requestDate = new Date();

  const result = await adoptionCollection.insertOne(adoptionData);

  res.send(result);
});
app.get("/adoptions", async (req, res) => {
  const email = req.query.email;

  const query = { userEmail: email };

  const result = await adoptionCollection.find(query).toArray();

  res.send(result);
});



      app.post("/adoptions", async (req, res) => {
  const adoptionData = req.body;

  adoptionData.status = "pending";

  adoptionData.requestDate = new Date();

  const result = await adoptionCollection.insertOne(adoptionData);

  res.send(result);
});
app.delete("/adoptions/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };

  const result = await adoptionCollection.deleteOne(query);

  res.send(result);
});

    console.log("MongoDB connected successfully");
  } finally {
  }
}

run().catch(console.dir);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
