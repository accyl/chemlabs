/// <reference path='command.ts'/>

namespace Tokenizers {
    export function WStringTknr(inp: string, startidx = 0): [AtomTracker, QtyUnitList] {
        if (startidx >= inp.length)
            throw ReferenceError("bruh"); // really?
        if (_isNumeric(inp[startidx])) {
            let qbdr = new QtyUnitList();
            let [qty, idx, _] = quantitiesTokenizer(inp, startidx, qbdr);
            let [__, idx2] = whitespaceTokenizer(inp, idx);
            let fbdr = new AtomTracker();
            let [formula, idx3] = formulaTokenizer(inp, idx2, fbdr);
            return [fbdr, qbdr];
        } else {

            let fbdr = new AtomTracker();
            let [formula, idx] = formulaTokenizer(inp, startidx, fbdr);
            let qbdr = new QtyUnitList();
            let [qty, idx2, _] = quantitiesTokenizer(inp, idx, qbdr);
            let [__, idx3] = whitespaceTokenizer(inp, idx2);
            return [fbdr, qbdr];
        }
    }
}
const tungsten = function (inp: string, display = true): Substance {
    let subst;
    let [chem, qty] = Tokenizers.WStringTknr(inp);
    // form.formula
    let formula = chem.formula;
    let protos = undefined;
    if (chemicals.has(formula)) {
        protos = chemicals.get(formula);
    } else {
        protos = chemicals.saveCustom(chem);
        console.log(`formula ${formula} not found in list of chemicals. autogenerating...`);
    }
    if (protos) {
        // let pargs = protos.args();
        // let qbuild = qty.toBuilder();
        subst = protos.amount(qty.computed(), chem.state);

    } else {
        throw protos;
    }
    // } else {
    if (display) {
        tangify(subst);
        updateZIndex();
        redraw();
        return subst;
    } else {
        return subst;
    }
    // TODO: with a greedy algorithm, we can
    // actually attempt to process formulas that
    // are 'lazily' in all lower case. for
    // example kmno4. 
    // although by definition it won't always work - see no
    // or hga - HGa
} as { (inp: string, display?: boolean): Substance; c: (inp: string) => SubstanceMaker | undefined; };
const W = tungsten;