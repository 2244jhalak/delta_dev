const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
    origin: ["https://delta-dev-test-project.vercel.app", "http://localhost:5173"],
    credentials: true,
    optionSuccessStatus: 200,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqysnnt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let postsCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        postsCollection = client.db("deltaDev").collection("posts");
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
connectToDatabase();

app.post("/posts", async (req, res) => {
    try {
        const { title, description, image, category, meta = {} } = req.body;
        if (!title || !description || !image || !category) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const result = await postsCollection.insertOne({ title, description, image, category, meta });
        res.status(201).json({
            message: "Post created successfully.",
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error("Error inserting post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/posts", async (req, res) => {
    try {
        const posts = await postsCollection.find().toArray();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).send({ message: "Error fetching post" });
    }
});

// Graceful Shutdown
// process.on("SIGINT", async () => {
//     console.log("Closing MongoDB connection...");
//     await client.close();
//     process.exit(0);
// });

app.listen(port, () => {
    console.log(`DeltaDev is running on ${port}`);
});

