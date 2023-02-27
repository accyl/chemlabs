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
const tungstenCreate = function (inp: string, display = true): ChemComponent {
    let subst;
    let [chem, qty] = Tokenizers.WStringTknr(inp);
    // form.formula
    let formula = chem.formula;
    let protos = undefined;
    if (chemicals.hasFormula(formula)) {
        protos = chemicals.getFromFormula(formula);
    } else {
        protos = chemicals.setFromTracker(chem);
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
} as { (inp: string, display?: boolean): ChemComponent; g: (inp: string) => ChemPrototype | undefined; };
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
function tungstenFind(selector: num | string): ChemComponent[] {
    if(typeof selector === 'number') {
        return [glob.s[selector]];
    } else {
        let [chem, qty] = Tokenizers.WStringTknr(selector);
        let out = glob.s.filter(s => s.type.chemicalFormula === chem.formula);
        let cqty = qty.computed();
        if(cqty.mass !== undefined) out = out.filter(s => s.mass === cqty.mass);
        if(cqty.vol !== undefined) out = out.filter(s => s.volume === cqty.vol);
        if(cqty.state !== undefined) out = out.filter(s => s.state === cqty.state);
        if(cqty.mol !== undefined) out = out.filter(s => 'mol' in s && (s as MolecularSubstance).mol === cqty.mol);
        return out;
    }
}
const $Wf = tungstenFind;

const $Wg = function(args: string) {
    return chemicals.getFromFormula(args);
}