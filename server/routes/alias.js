import express from "express";
import db from "../db/conn.js";
import _ from "lodash";

const router = express.Router();
// Get a list of 50 posts
router.get("/:alias", async(req, res) => {
    let collection = await db.collection("merged");

    let regex = new RegExp('\(' + _.escapeRegExp(req.params.alias) + '\)', 'i')
    let query = {$or: [{name: regex}, {alias: regex}]};
    // let query = {alias: }

    // TODO evaluate the significance of injection attacks
    let results = await collection.find(query)
        .limit(10)
        .toArray();

    res.send(results).status(200);
});

export default router;