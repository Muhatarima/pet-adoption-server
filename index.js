const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuqwjlp.mongodb.net/?appName=Cluster0`;

if (!process.env.MONGODB_URI && (!process.env.DB_USER || !process.env.DB_PASS)) {
  console.warn("MongoDB credentials are missing. Set MONGODB_URI or DB_USER/DB_PASS.");
}

const allowedOrigins = [
  "http://localhost:3000",
  "https://pet-adopt-client-xi.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("petAdoptionDB");
const petsCollection = database.collection("pets");
const adoptionCollection = database.collection("adoptionRequests");

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }

    req.decoded = decoded;
    next();
  });
};

app.get("/", (req, res) => {
  res.send("Pet Adoption Server Running");
});

app.get("/pets", async (req, res) => {
  try {
    const search = req.query.search || "";
    const species = req.query.species;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (species) {
      query.species = { $in: species.split(",") };
    }

    const result = await petsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/pets", async (req, res) => {
  try {
    const newPet = {
      ...req.body,
      adoptionStatus: req.body.adoptionStatus || "available",
      createdAt: req.body.createdAt || new Date(),
    };

    const result = await petsCollection.insertOne(newPet);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/pets/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).send({ message: "Invalid pet id" });

    const result = await petsCollection.findOne({ _id });
    if (!result) return res.status(404).send({ message: "Pet not found" });

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.put("/pets/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).send({ message: "Invalid pet id" });

    const result = await petsCollection.updateOne(
      { _id },
      { $set: req.body }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.patch("/pets/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).send({ message: "Invalid pet id" });

    const result = await petsCollection.updateOne(
      { _id },
      { $set: req.body }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete("/pets/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).send({ message: "Invalid pet id" });

    const result = await petsCollection.deleteOne({ _id });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/adoptions", async (req, res) => {
  try {
    const adoptionData = req.body;

    if (adoptionData.ownerEmail === adoptionData.userEmail) {
      return res.status(400).send({ message: "You cannot adopt your own pet" });
    }

    const result = await adoptionCollection.insertOne({
      ...adoptionData,
      status: "pending",
      requestDate: new Date(),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/adoptions", async (req, res) => {
  try {
    const email = req.query.email;
    const petId = req.query.petId;
    const query = {};

    if (email) query.userEmail = email;
    if (petId) query.petId = petId;

    const result = await adoptionCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/adoptions/pet/:petId", async (req, res) => {
  try {
    const result = await adoptionCollection
      .find({ petId: req.params.petId })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.patch("/adoptions/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).send({ message: "Invalid request id" });

    const { status, petId } = req.body;
    const adoptionResult = await adoptionCollection.updateOne(
      { _id },
      { $set: { status } }
    );

    if (status === "approved" && petId) {
      const petObjectId = toObjectId(petId);
      if (petObjectId) {
        await petsCollection.updateOne(
          { _id: petObjectId },
          { $set: { adoptionStatus: "adopted" } }
        );
      }

      await adoptionCollection.updateMany(
        { petId, _id: { $ne: _id } },
        { $set: { status: "rejected" } }
      );
    }

    res.send(adoptionResult);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete("/adoptions/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.status(400).send({ message: "Invalid request id" });

    const result = await adoptionCollection.deleteOne({ _id });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/my-pets", async (req, res) => {
  try {
    const email = req.query.email;
    const result = await petsCollection.find({ ownerEmail: email }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || "secret", {
    expiresIn: "7d",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});

app.post("/logout", async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});

app.get("/protected-check", verifyToken, (req, res) => {
  res.send({ ok: true, user: req.decoded });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
