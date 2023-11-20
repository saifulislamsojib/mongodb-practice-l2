const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

const port = 5000 || process.env.PORT;

const uri = "mongodb://0.0.0.0:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const db = client.db("mission-two");
    const userCollection = db.collection("users");

    const getThePerson = (
      projectKey = "skills",
      email = "aminextleveldeveloper@gmail.com"
    ) =>
      userCollection.findOne(
        { email },
        { projection: { email: 1, [projectKey]: 1, _id: 0 } }
      );

    // get all
    app.get("/", async (req, res) => {
      const users = await userCollection.find().toArray();
      console.log(users);
      res.send({ users, count: users.length });
    });

    // problem 1
    app.get("/older-user", async (req, res) => {
      const users = await userCollection
        .find({ age: { $gt: 30 } })
        .project({ name: 1, email: 1 })
        .toArray();
      console.log(users);
      console.log(users.length);
      res.send({ users, count: users.length });
    });

    // problem 2
    app.get("/favorite-color", async (req, res) => {
      const users = await userCollection
        .find({ favoutiteColor: { $in: ["Maroon", "Blue"] } })
        .project({ name: 1, favoutiteColor: 1 })
        .toArray();
      console.log(users);
      console.log(users.length);
      res.send({ users, count: users.length });
    });

    // problem 3
    app.get("/skills-empty-array", async (req, res) => {
      const users = await userCollection
        .find({ skills: { $size: 0 } })
        .project({ name: 1, skills: 1 })
        .toArray();
      console.log(users);
      console.log(users.length);
      res.send({ users, count: users.length });
    });

    // problem 4
    app.get("/favorite-skills", async (req, res) => {
      // const users = await userCollection
      //   .find({ "skills.name": { $in: ["JAVASCRIPT", "JAVA"] } })
      //   .project({ name: 1, skills: 1 })
      //   .toArray();
      const regex = ["JavaScript", "Java"].map(
        (it) => new RegExp(`^${it}$`, "i")
      );

      const users = await userCollection
        .find({
          "skills.name": { $in: regex },
        })
        .project({ name: 1, skills: 1 })
        .toArray();
      console.log(users);
      console.log(users.length);
      res.send({ users, count: users.length });
    });

    // problem 5
    app.patch("/add-skill", async (req, res) => {
      const preUser = await getThePerson();
      console.log(preUser);
      const skill = "Python";
      const result = await userCollection.updateOne(
        {
          email: "aminextleveldeveloper@gmail.com",
        },
        {
          $addToSet: {
            skills: {
              name: skill.toUpperCase(),
              level: "Beginner",
              isLearning: true,
            },
          },
        }
      );
      const user = await getThePerson();
      console.log(user);
      res.send({ preUser, user, result });
    });

    // problem 6
    app.patch("/add-language", async (req, res) => {
      const preUser = await getThePerson("languages");
      console.log(preUser);
      const result = await userCollection.updateOne(
        {
          email: "aminextleveldeveloper@gmail.com",
        },
        {
          $addToSet: {
            languages: "Spanish",
          },
        }
      );
      const user = await getThePerson("languages");
      console.log(user);
      res.send({ preUser, user, result });
    });

    // problem 7
    app.patch("/remove-skill", async (req, res) => {
      const preUser = await getThePerson();
      console.log(preUser);
      const skill = "Kotlin";
      const result = await userCollection.updateOne(
        {
          email: "aminextleveldeveloper@gmail.com",
        },
        {
          $pull: {
            skills: { name: new RegExp(`^${skill}$`, "i") },
          },
        }
      );
      const user = await getThePerson();
      console.log(user);
      res.send({ preUser, user, result });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening on port " + port);
});
