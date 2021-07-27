"use strict";
function w(inp) {
    var _a = grandUnifiedTknr(inp), chem = _a[0], qty = _a[1];
    // form.formula
    var formula = chem.formula;
    if (chemicals.has(formula)) {
        var protos = chemicals.get(formula);
        if (protos) {
            // let pargs = protos.args();
            // let qbuild = qty.toBuilder();
            return protos.amt(qty);
        }
        else {
            throw protos;
        }
    }
    else {
        throw "formula " + formula + " not found in list of chemicals!";
    }
    // TODO: with a greedy algorithm, we can
    // actually attempt to process formulas that
    // are 'lazily' in all lower case. for
    // example kmno4. 
    // although by definition it won't always work - see no
    // or hga - HGa
}
