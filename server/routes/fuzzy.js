import express from "express";
import db from "../db/conn.js";
import _ from "lodash";

const router = express.Router();


function queryRequirePrefix(prefix, baseQuery = {}) { // query with any 
    baseQuery['prefix'] = new RegExp(`^${_.escapeRegExp(prefix)}$`, 'i');
    return baseQuery;
}
function queryRequireSecond(second, baseQuery={}) { // query with any prefix
    baseQuery['name'] = new RegExp(_.escapeRegExp(second), 'i');
    return baseQuery;
}
function queryFromBinomial(prefix, second) {
    let ret = {};
    queryRequirePrefix(prefix, ret);
    queryRequireSecond(second, ret);

    return ret;
}
function toQuery(prefix, second) {
    // 1st      | 2nd       | case
    // <prefix> |<name>     | (1)
    // "any"    |<name>     | (2)
    // <prefix> |"any"      | (3): Note: there may be valid instances where we want to search names with substring "any". 
    // in that case, jhust force the user to type "Any" since regex is case insensitive.
    // <prefix> |           | (3) --> note: searching for explicitly none (ie. "Aluminum") is a task for exact.js
    // <name>   |           | (2)
    //          |           | (4)
    if(second === 'any') second = null;
    if(prefix === 'any') prefix = null;
    if(!second && !prefix) { // we want anything
        return {};
    } else if(!second) { // case 3
        // we expect prefix to be nonnull
        return queryRequirePrefix(prefix);
    } else if(!prefix) {
        return queryRequireSecond(second);
    } else {
        // we expect both second and prefix
        return queryFromBinomial(prefix, second);
    }

}
async function getCollection() {
    return await db.collection("merged");
}
router.get("/:name1/:name2?", async(req, res) => {
    let collection = await getCollection("merged");

    let first = req.params.name1;
    let second = req.params.name2;

    let query = undefined;
    if(first && second) {
        query = toQuery(first, second);
    } else if(first && !second) {
        // if we're only given one, it's a spot of trouble
        // for example, if given name/
        query = {'$or': [toQuery(null, first), toQuery(first, null)]};
    }
    // TODO evaluate the significance of injection attacks
    let results = await collection.find(query)
        .limit(10)
        .toArray();

    res.send(results).status(200);
});

// router.get("/prefix/:prefix", async (req, res) => {
//     let collection = getCollection("merged");

//     let prefix = req.params.prefix;
//     let query = toQuery(prefix, null);

//     let results = await collection.find(query)
//         .limit(10)
//         .toArray();

//     res.send(results).status(200);
// });

export default router;