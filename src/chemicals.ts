/// <reference path='chem.ts'/>

const chemicals = new Map() as Map<string, ProtoSubstance> & { saveCustom: (chem: ChemicalBuilder) => ProtoSubstance };

/**
 * dynamically creates a new chemical entry with the specified ChemicalBuilder chemical and which
 * exposes the ProtoSubstance with which you can create massed substances
 * @param chem ChemicalBuilder that the chemical composition of the new substance
 * @returns the ProtoSubstance, which can at any time be accessed through $c(key: string)
 */
chemicals.saveCustom = function (chem: ChemicalBuilder) {
    let formula = chem.formula;
    let atomt = chem.atomt;
    let all = {
        chemicalFormula: formula,
        molarMass: atomt.molarMass(),
        rgb: [250, 250, 250]
    };
    let phase = chem.state;
    if (!phase && atomt._atoms.length == 1) {
        // a substance comprised of a single atom
        let anum = atomt._atomicNums[0];
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
            all.rgb = _rgb(rgb);
        }
    }
    let state = { state: phase };
    let proto = chemicalFromJson(all, state);
    chemicals.set(formula, proto);
    return proto;
}
// new method below

type JsonChemical = { state: string };
function chemicalFromJson(all: any, defaul: JsonChemical, altStates?: JsonChemical[], freeze = true): ProtoSubstance { //sObj?: any, lObj?: any, gObj?: any, aqObj?: any){
    return ProtoSubstance.fromJson(all, defaul, altStates, freeze);
}

chemicals.set('H2O', function(){
    let g = new ProtoSubstance();
    g.state = "g";
    g.specificHeatCapacity = 2.080;

    let l = new ProtoSubstance();
    l.state = "l";
    l.density = 999.8395;
    l.specificHeatCapacity = 4.184;
    l.rgb = [0xF0, 0xF0, 0xFF];

    let s = new ProtoSubstance();
    s.state = "s";
    s.density = 916.8; // ice
    s.specificHeatCapacity = 2.05;

    g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
    g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;

    l._getWithArgs = function (args: PSArgs): ProtoSubstance {
        if (args.state === "s") return s;
        if (args.state === "l") return l;
        if (args.state === "g") return g;
        return l;
    }

    Object.freeze(g);
    Object.freeze(l);
    Object.freeze(s);

    return l;
}());
chemicals.set('KMnO4', function(){
    // molar mass: 158.033949
    let aq = new ProtoSubstance();
    // me.stateOfMatter = "s"; // TODO this feels dumb
    aq.state = "aq";
    // aq.molar_absorptivity = [0.8, 1.75, 0.45];
    // aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
    aq.molar_absorptivity = [3160.68, 6913.98751, 1777.8825];
    aq.form = function () {
        // return new AqueousSubstance(this, w("H2O 1L")); // H2O.args().setState("l").amt("1 L").form());
        let x = new SpectralAqueousSubstance(this, w("H2O 1L", false), spectra_kmno4_f); 
        // x.maxConcentration = 0.405;
        return x;
    };

    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol

    let s = new ProtoSubstance();
    s.state = 's';
    s.rgb = [0x9F,0x00,0xFF];
    s.density = 2700;
    aq._getWithArgs = function (args: PSArgs): ProtoSubstance {
        if (args.state === "aq") return aq;
        if (args.state === "s") return s;
        return aq; // default condition, for if a state is omitted

    }
    Object.freeze(s); 
    Object.freeze(aq); // lock 
    return aq;
}());

chemicals.set('H2', function () {
    let g = {state: "g"};

    let l = {state:"l",
    density: 70.85}; // g/L

    let all = {
        chemicalFormula: 'H2',
        molarMass: 2.016,
        rgb: [250, 250, 255]

    };
    // g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;

    return chemicalFromJson(all, g, [l]);
}());

// new method above
// old method below

// const H2O = function() {
//     let g = new ProtoSubstance();
//     g.state = "g";
//     g.specificHeatCapacity = 2.080;

//     let l = new ProtoSubstance();
//     l.state = "l";
//     l.density = 0.9998395;
//     l.specificHeatCapacity = 4.184;

//     let s = new ProtoSubstance();
//     s.state = "s";
//     s.density = 0.9168; // ice
//     s.specificHeatCapacity = 2.05;

//     g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
//     g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;

//     g._getWithArgs = function(args: PSArgs): ProtoSubstance {
//         if(args.state === "s") return s;
//         if (args.state === "l") return l;
//         if (args.state === "g") return g;
//         return ProtoSubstance.NONE;

//     }

//     Object.freeze(g);
//     Object.freeze(l);
//     Object.freeze(s);

//     return g;
// }();
// const KMnO4 = function() {
//     // molar mass: 158.033949
//     let aq = new ProtoSubstance();
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
let s = sObj ? Object.assign(constructed ? constructed[0] : new ProtoSubstance(), sObj, all) : undefined;
let l = lObj ? Object.assign(constructed ? constructed[1] : new ProtoSubstance(), lObj, all) : undefined;
let g = gObj ? Object.assign(constructed ? constructed[2] : new ProtoSubstance(), gObj, all) : undefined;
let aq = aqObj ? Object.assign(constructed ? constructed[3] : new ProtoSubstance(), aqObj, all) : undefined;
let ndef: (ProtoSubstance & {}|undefined);
if(defObj === sObj) ndef = s;
else if(defObj === lObj) ndef = l;
else if(defObj === gObj) ndef = g;
else if(defObj === aqObj) ndef = aq;
if(!ndef) ndef = s ? s : (g ? g : (l ? l : (aq ? aq : undefined)));
if(!ndef) throw "Nothing provided?"; // pick solid as a default
let def = ndef as ProtoSubstance;
def._getProtoSubstanceWithArgsOf = function (args: ProtoSubstanceWithArgs): ProtoSubstance {
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
