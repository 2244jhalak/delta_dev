const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
    origin : ["https://delta-dev-test-project.vercel.app",'http://localhost:5173'],
    credentials:true,
    optionSuccessStatus:200
}

// middleware
app.use(express.json());
app.use(cors(corsOptions));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqysnnt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const postsCollection=client.db("deltaDev").collection("posts");
    
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  app.post("/posts", async (req, res) => {
  try {
    const postData = req.body;

    // Validate required fields
    const { title, description, image, category, meta } = postData;
    if (!title || !description || !image || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Insert post into the collection
    const result = await postsCollection.insertOne(postData);
    console.log("Post inserted:", result);

    res.status(201).json({
      message: "Post created successfully.",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error inserting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/posts', async (req, res) => {
        try {
          
            const posts = await postsCollection.find().toArray();
    
         
            res.status(200).json(posts);
        } catch (error) {
            
            console.error('Error fetching posts:', error);
            res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
        }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id; 

    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    res.status(200).json(post); // Return the post data
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send({ message: "Error fetching post" });
  } 
});

  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`DeltaDev is running on ${port}`);
})
