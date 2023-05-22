import express from "express";
import db from "../db/conn.js";
import _ from "lodash";

const router = express.Router();

function canonicalize(name) {
    if(/^bi/.test(name)) {
        // in the database, the only names that start with bi are bismuth and bismuthate, and bis(acetylsalicylate)
        if(!name.startsWith("bis") && (name.endsWith("ate") || name.endsWith("ide") || name.endsWith("ite"))) {
            // then it's very likely to be something like bicarbonate
            return "hydrogen " + name.substring(2);
        }
    }
    return name;
    // TODO methodologica
}

router.get("/:prefix/:name?", async(req, res) => {
    let collection = await db.collection("merged");

    let prefix = req.params.prefix;
    let name = canonicalize(req.params.name);

    let rname = name ? new RegExp('^' + _.escapeRegExp(name) + '$', 'i') : null; // we want to search for a missing name

    let regex = new RegExp('^' + _.escapeRegExp(prefix) + '$', 'i');
    let query = { prefix: regex, name: rname };

    let withalias = { $or: [query, { alias: regex }] };


    let results = await collection.find(withalias)
        .limit(10)
        .toArray();

    res.send(results).status(200);
});

export default router;