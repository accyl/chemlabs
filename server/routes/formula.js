import express from "express";
import db from "../db/conn.js";
import _ from "lodash";

const router = express.Router();
// Get a list of 50 posts
router.get("/:formula", async(req, res) => {
    let collection = await db.collection("merged");

    let formula = req.params.formula;
        // for example, H2O -> H_(2)O
        // H2O2 -> H_(2)O_(2)
        // (NH4)2CO3 -> (NH_(4))_(2)CO_(3)
        // Na2CO3 * NaHCO3 * 2H2O -> Na_(2)CO_(3)*NaHCO_(3) * 2H_(2)O
        // K2C4H4O6*0.5H2O --> K_(2)C_(4)H_(4)O_(6)*0.5H_(2)O

        // deuterium ^(2)H2O --> ^(2)H_(2)O 
    // cast to string
    formula = formula.toString();
    let want = formula;
    if(/\d/.test(formula) ){
        // if there's a number, we have to make sure it's in to latex form
        if( !formula.includes('_')) { 
            // make sure it's not already in latex form
            // luckily, this operation is idempotent anyways
            // use the simple heuristic: if there's a number that follows a letter or paren, then we need to insert an underscore
            want = formula.replace(/([A-Za-z\)])(\d+)/g, '$1_($2)');
        }
    }
    // console.log(want);
    want = _.escapeRegExp(want); // escape regex
    let query = { formula: new RegExp('^' + want + '$', 'i') };
    // TODO evaluate the significance of injection attacks
    let results = await collection.find(query)
        .limit(10)
        .toArray();

    res.send(results).status(200);
});

export default router;