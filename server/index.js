import express from "express";
import cors from "cors";
// import homepageRouter from "./homepageRouter.js";
import fuzzy from "./routes/fuzzy.js";
import alias from "./routes/alias.js";
import exact from "./routes/exact.js";
import formula from "./routes/formula.js";

const port = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: 'http://127.0.0.1:5173' })); // allow requests from the vite dev server

app.get("/api/v1/hello", (_req, res) => {
    res.json({ message: "Hello, world!" });
});


app.use(express.json()); // by default, just use the default JSOn parse
// Load the /posts routes
app.use("/api/fuzzy", fuzzy);
app.use("/api/alias", alias);
app.use("/api/exact", exact);
app.use("/api/formula", formula);

// app.use(homepageRouter);


// Global error handling
app.use((err, _req, res, next) => {
    res.status(500).send("Uh oh! An unexpected error occured.")
});

app.listen(port, () => {
    console.log("Server listening on port", port);
});