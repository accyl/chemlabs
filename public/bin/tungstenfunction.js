"use strict";
/// <reference path='command.ts'/>
var Tokenizers;
(function (Tokenizers) {
    function WStringTknr(inp, startidx = 0) {
        if (startidx >= inp.length)
            throw ReferenceError("bruh"); // really?
        if (Tokenizers._isNumeric(inp[startidx])) {
            let qbdr = new Tokenizers.QtyUnitList();
            let [qty, idx, _] = Tokenizers.quantitiesTokenizer(inp, startidx, qbdr);
            let [__, idx2] = Tokenizers.whitespaceTokenizer(inp, idx);
            let fbdr = new AtomTracker();
            let [formula, idx3] = Tokenizers.formulaTokenizer(inp, idx2, fbdr);
            return [fbdr, qbdr];
        }
        else {
            let fbdr = new AtomTracker();
            let [formula, idx] = Tokenizers.formulaTokenizer(inp, startidx, fbdr);
            let qbdr = new Tokenizers.QtyUnitList();
            let [qty, idx2, _] = Tokenizers.quantitiesTokenizer(inp, idx, qbdr);
            let [__, idx3] = Tokenizers.whitespaceTokenizer(inp, idx2);
            return [fbdr, qbdr];
        }
    }
    Tokenizers.WStringTknr = WStringTknr;
})(Tokenizers || (Tokenizers = {}));
const tungstenCreate = function (inp, display = true) {
    let subst;
    let [chem, qty] = Tokenizers.WStringTknr(inp);
    // form.formula
    let formula = chem.formula;
    let protos = undefined;
    if (chemicals.has(formula)) {
        protos = chemicals.get(formula);
    }
    else {
        protos = chemicals.createMaker(chem);
        console.log(`formula ${formula} not found in list of chemicals. autogenerating...`);
    }
    if (protos) {
        // let pargs = protos.args();
        // let qbuild = qty.toBuilder();
        subst = protos.amount(qty.computed(), chem.state);
    }
    else {
        throw protos;
    }
    // } else {
    if (display) {
        tangify(subst);
        updateZIndex();
        redraw();
        return subst;
    }
    else {
        return subst;
    }
    // TODO: with a greedy algorithm, we can
    // actually attempt to process formulas that
    // are 'lazily' in all lower case. for
    // example kmno4. 
    // although by definition it won't always work - see no
    // or hga - HGa
};
/**
 * W c = Tungsten create
 */
const $Wc = tungstenCreate;
/**
 * Find all elements that match the selector
 * @param selector
 * If selector is a number, it is interpreted as the index.
 * @returns
 */
function tungstenFind(selector) {
    if (typeof selector === 'number') {
        return [glob.s[selector]];
    }
    else {
        let [chem, qty] = Tokenizers.WStringTknr(selector);
        let out = glob.s.filter(s => s.type.chemicalFormula === chem.formula);
        let cqty = qty.computed();
        if (cqty.mass !== undefined)
            out = out.filter(s => s.mass === cqty.mass);
        if (cqty.vol !== undefined)
            out = out.filter(s => s.volume === cqty.vol);
        if (cqty.state !== undefined)
            out = out.filter(s => s.state === cqty.state);
        if (cqty.mol !== undefined)
            out = out.filter(s => 'mol' in s && s.mol === cqty.mol);
        return out;
    }
}
const $Wf = tungstenFind;
const $Wg = function (args) {
    return chemicals.get(args);
};
