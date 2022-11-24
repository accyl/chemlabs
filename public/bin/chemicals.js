"use strict";
/// <reference path='substance.ts'/>
class ChemicalsDatabaseImpl {
    constructor() {
        this.canonicalMap = new Map();
        this.chemicalsMap = new Map();
        // new method below
    }
    /**
     * Will always return the substance in STP state.
     * @param canonical
     * @returns
     */
    getFromCanonical(canonical) {
        // throw new Error("Method not implemented.");
        return this.chemicalsMap.get(canonical);
    }
    toCanonical(formula) {
        return this.canonicalMap.get(formula);
    }
    /**
     * Will always return the substance in STP state.
     * @param formula
     * @returns
     */
    getFromFormula(formula) {
        let canonical = this.toCanonical(formula);
        if (canonical) {
            return this.chemicalsMap.get(canonical);
        }
    }
    pasteAll() {
        throw new Error("Method not implemented.");
    }
    pasteChanges() {
        throw new Error("Method not implemented.");
    }
    loadAll(paste) {
        throw new Error("Method not implemented.");
    }
    setFromCanonical(canon, model) {
        this.chemicalsMap.set(canon, model);
        this.canonicalMap.set(model.chemicalFormula, canon);
    }
    setFromFormula(form, model) {
        let canon = this.formToInChI(form);
        if (canon) {
            this.canonicalMap.set(form, canon);
            this.chemicalsMap.set(canon, model);
        }
    }
    formToInChI(form) {
        // here we have two options. 
        // 1. we cache a bunch of formulas and files, and we can just look them up
        // 2. we force the user to provide the exact structure of the molecule, which
        // we then can use InChI.js to convert to the canonical form
        // 3. we use a web service to get the canonical form
        throw new Error("Method not implemented.");
    }
    hasFormula(form) {
        return this.canonicalMap.has(form);
    }
    hasCanonical(canon) {
        return this.chemicalsMap.has(canon);
    }
    /**
     * dynamically creates a new chemical entry with the specified AtomTracker chemical and which
     * exposes the ProtoSubstance with which you can create massed substances
     *
     * If an exact substance already exists, the previous one is returned.
     * @param atomt AtomTracker that the chemical composition of the new substance
     * @returns the ProtoSubstance, which can at any time be accessed through $c(key: string)
     */
    setFromTracker(atomt) {
        let formula = atomt.formula;
        // first we check that we don't already have one
        let already = this.getFromFormula(formula); // chemicals.get(formula);
        if (already) {
            let withstate = already.getNonSTPSelf(atomt.state);
            if (withstate) {
                return withstate;
            }
            // if we get to this point, then there is an already existing chemical, but not of the right state
        }
        // if we get to this point, then we need to create a new chemical
        let all = {
            chemicalFormula: atomt.formula,
            molarMass: atomt.molarMass(),
            newAtomTracker: atomt,
            rgb: "#F7F7F7",
            density: undefined
        };
        let phase = atomt.state;
        if (!phase && atomt.atoms.length == 1) {
            // a substance comprised of a single atom
            let anum = atomt.atomicNums[0];
            switch (ptable[anum].phase) {
                case 'Solid':
                    phase = 's';
                    break;
                case 'Liquid':
                    phase = 'l';
                    break;
                case 'Gas':
                    phase = 'g';
                    break;
            }
            let rgb = ptable[anum].rgb;
            if (rgb) {
                // all.rgb = 
                all.rgb = '#' + rgb; // _rgb(rgb);
            }
        }
        let state = { state: phase };
        let proto = SubstanceMaker.fromJson(all, state, undefined, false);
        if (already) {
            proto.STPSelf = already;
            already.registerNonSTPSelf(proto, atomt.state);
        }
        else {
            chemicals.setFromFormula(formula, proto);
        }
        return proto;
    }
    /**
     * Saves the protosubstance, but updated with the new quantity's state,
     * into the database.
     * @param qty
     * @param model
     * @returns It should return a protosubstance with the same properties
     * as the one passed in, but with the new state.
     * It should be equivalent to the one returned by $c(key: string)
     */
    setWithNewState(model, state) {
        let atomTracker = new AtomTracker(model.getSTPSelf());
        atomTracker.state = state ? state : model.state;
        let result = chemicals.setFromTracker(atomTracker);
        assert(result === chemicals.getFromFormula(model.chemicalFormula));
        return result;
    }
}
const chemicals = new ChemicalsDatabaseImpl();
chemicals.setFromCanonical('1S/H2O/h1H2', function () {
    // source: https://pubchem.ncbi.nlm.nih.gov/compound/Water#section=IUPAC-Name
    // CAS: 7732-18-5
    // InChI: InChI=1S/H2O/h1H2
    let l = new SubstanceMaker('l');
    l.density = 999.8395;
    l.specificHeatCapacity = 4.184;
    l.rgb = '#F0F0FF'; // [0xF0, 0xF0, 0xFF];
    let g = new SubstanceMaker('g', l);
    g.specificHeatCapacity = 2.080;
    let s = new SubstanceMaker('s', l);
    s.density = 916.8; // ice
    s.specificHeatCapacity = 2.05;
    g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
    g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;
    g.finalize(true);
    l.finalize(true);
    s.finalize(true);
    return l;
}());
chemicals.setFromCanonical('1S/K.Mn.4O/q+1;;;;;-1', function () {
    // source: https://pubchem.ncbi.nlm.nih.gov/compound/Potassium-permanganate
    // InChI=1S/K.Mn.4O/q+1;;;;;-1
    // CAS: 7722-64-7
    // molar mass: 158.033949
    let aq = new SubstanceMaker('aq', undefined, makeSpectralAqueous(makeAqueous(makeMolecular(Substance), $Wc("H2O 1L", false)), spectra_kmno4_f));
    aq.state = "aq";
    // aq.molar_absorptivity = [0.8, 1.75, 0.45];
    // aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
    // aq.molar_absorptivity = [3160.68, 6913.98751, 1777.8825];
    // aq.form = function () {
    //     // return new AqueousSubstance(this, w("H2O 1L")); // H2O.args().setState("l").amt("1 L").form());
    //     let x = new SpectralAqueousSubstance(this, W("H2O 1L", false), spectra_kmno4_f); 
    //     // x.maxConcentration = 0.405;
    //     return x;
    // };
    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol
    let s = new SubstanceMaker('s', aq);
    // s.state = 's';
    s.rgb = '#9F00FF'; // [0x9F,0x00,0xFF];
    s.density = 2700;
    // aq.getWithArgs = function (args: ComputedQty): ProtoChemical {
    //     if (args.state === "aq") return aq;
    //     if (args.state === "s") return s;
    //     return aq; // default condition, for if a state is omitted
    // }
    s.finalize(true);
    aq.finalize(true); // lock 
    return aq;
}());
chemicals.setFromCanonical('1S/H2/h1H', function () {
    let g = { state: "g" };
    let l = { state: "l", density: 70.85 }; // g/L
    let all = {
        chemicalFormula: 'H2',
        molarMass: 2.016,
        rgb: [250, 250, 255]
    };
    return SubstanceMaker.fromJson(all, g, [l]);
}());
$Wc.g = function (key) {
    return chemicals.getFromFormula(key);
};
// new method above
// old method below
// const H2O = function() {
//     let g = new ProtoChemical();
//     g.state = "g";
//     g.specificHeatCapacity = 2.080;
//     let l = new ProtoChemical();
//     l.state = "l";
//     l.density = 0.9998395;
//     l.specificHeatCapacity = 4.184;
//     let s = new ProtoChemical();
//     s.state = "s";
//     s.density = 0.9168; // ice
//     s.specificHeatCapacity = 2.05;
//     g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
//     g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;
//     g._getWithArgs = function(args: PSArgs): ProtoChemical {
//         if(args.state === "s") return s;
//         if (args.state === "l") return l;
//         if (args.state === "g") return g;
//         return ProtoChemical.NONE;
//     }
//     Object.freeze(g);
//     Object.freeze(l);
//     Object.freeze(s);
//     return g;
// }();
// const KMnO4 = function() {
//     // molar mass: 158.033949
//     let aq = new ProtoChemical();
//     // me.stateOfMatter = "s"; // TODO this feels dumb
//     aq.state = "aq";
//     aq.molar_absorptivity = [0.8, 1.75, 0.45];
//     aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
//     // aq.molar_absorptivity = [3160.68,6913.98751,1777.8825];
//     aq.form = function() {
//         let args = new PSArgs(H2O);
//         args.state = 'l';
//         args.volmL = 1000;
//         let x = new AqueousSubstance(this, args.form());
//         // x.maxConcentration = 0.405; // 6.4 g/100mL = 0.04049761443739955 mol / 0.1 L = 0.405 M
//         return x;
//     };
//     aq.chemicalFormula = "KMnO4";
//     aq.molarMass = 158.034; // g/mol
//     Object.freeze(aq); // lock 
//     return aq;
// }();
// old method above
/*
let s = sObj ? Object.assign(constructed ? constructed[0] : new ProtoChemical(), sObj, all) : undefined;
let l = lObj ? Object.assign(constructed ? constructed[1] : new ProtoChemical(), lObj, all) : undefined;
let g = gObj ? Object.assign(constructed ? constructed[2] : new ProtoChemical(), gObj, all) : undefined;
let aq = aqObj ? Object.assign(constructed ? constructed[3] : new ProtoChemical(), aqObj, all) : undefined;
let ndef: (ProtoChemical & {}|undefined);
if(defObj === sObj) ndef = s;
else if(defObj === lObj) ndef = l;
else if(defObj === gObj) ndef = g;
else if(defObj === aqObj) ndef = aq;
if(!ndef) ndef = s ? s : (g ? g : (l ? l : (aq ? aq : undefined)));
if(!ndef) throw "Nothing provided?"; // pick solid as a default
let def = ndef as ProtoChemical;
def._getProtoChemicalWithArgsOf = function (args: ProtoChemicalWithArgs): ProtoChemical {
    if (args.state === "s") return s ? s : def;
    if (args.state === "l") return l ? l : def;
    if (args.state === "g") return g ? g : def;
    if (args.state === 'aq') return aq ? aq : def;
    return def;
}
    if(s) Object.freeze(s);
if(l) Object.freeze(l);
if(g) Object.freeze(g);
if(aq) Object.freeze(aq);
*/
