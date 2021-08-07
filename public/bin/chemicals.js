"use strict";
/// <reference path='chem.ts'/>
var H2O = function () {
    var g = new ProtoSubstance();
    g.state = "g";
    g.specificHeatCapacity = 2.080;
    var l = new ProtoSubstance();
    l.state = "l";
    l.density = 0.9998395;
    l.specificHeatCapacity = 4.184;
    var s = new ProtoSubstance();
    s.state = "s";
    s.density = 0.9168; // ice
    s.specificHeatCapacity = 2.05;
    g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
    g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;
    g._getProtoSubstanceWithArgsOf = function (args) {
        if (args.state === "s")
            return s;
        if (args.state === "l")
            return l;
        if (args.state === "g")
            return g;
        return ProtoSubstance.NONE;
    };
    Object.freeze(g);
    Object.freeze(l);
    Object.freeze(s);
    return g;
}();
var KMnO4 = function () {
    // molar mass: 158.033949
    var aq = new ProtoSubstance();
    // me.stateOfMatter = "s"; // TODO this feels dumb
    aq.state = "aq";
    aq.molar_absorptivity = [0.8, 1.75, 0.45];
    aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
    // aq.molar_absorptivity = [3160.68,6913.98751,1777.8825];
    aq.form = function () {
        var x = new AqueousSubstance(this, H2O.args().setState("l").amt("1 L").form());
        // x.maxConcentration = 0.405; // 6.4 g/100mL = 0.04049761443739955 mol / 0.1 L = 0.405 M
        return x;
    };
    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol
    Object.freeze(aq); // lock 
    return aq;
}();
// old method above
// new method below
var chemicals = new Map();
chemicals.set('H2O', function () {
    var g = new ProtoSubstance();
    g.state = "g";
    g.specificHeatCapacity = 2.080;
    var l = new ProtoSubstance();
    l.state = "l";
    l.density = 999.8395;
    l.specificHeatCapacity = 4.184;
    l.rgb = [0xF0, 0xF0, 0xFFc];
    var s = new ProtoSubstance();
    s.state = "s";
    s.density = 916.8; // ice
    s.specificHeatCapacity = 2.05;
    g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
    g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;
    l._getProtoSubstanceWithArgsOf = function (args) {
        if (args.state === "s")
            return s;
        if (args.state === "l")
            return l;
        if (args.state === "g")
            return g;
        return l;
    };
    Object.freeze(g);
    Object.freeze(l);
    Object.freeze(s);
    return l;
}());
chemicals.set('KMnO4', function () {
    // molar mass: 158.033949
    var aq = new ProtoSubstance();
    // me.stateOfMatter = "s"; // TODO this feels dumb
    aq.state = "aq";
    // aq.molar_absorptivity = [0.8, 1.75, 0.45];
    // aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
    aq.molar_absorptivity = [3160.68, 6913.98751, 1777.8825];
    aq.form = function () {
        // return new AqueousSubstance(this, w("H2O 1L")); // H2O.args().setState("l").amt("1 L").form());
        var x = new SpectralAqueousSubstance(this, w("H2O 1L", false), spectra_kmno4_f);
        // x.maxConcentration = 0.405;
        return x;
    };
    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol
    var s = new ProtoSubstance();
    s.state = 's';
    s.rgb = [0x9F, 0x00, 0xFF];
    s.density = 2700;
    aq._getProtoSubstanceWithArgsOf = function (args) {
        if (args.state === "aq")
            return aq;
        if (args.state === "s")
            return s;
        return aq; // default condition, for if a state is omitted
    };
    Object.freeze(s);
    Object.freeze(aq); // lock 
    return aq;
}());
function chemicalFromJSON(all, defaul, altStates, freeze) {
    if (freeze === void 0) { freeze = true; }
    // TODO
    // any such function that constructs from JSON must be able to customize the constructor
    // For example using a spectralA
    // maybe make that itself as a json option flag?
    // THen we need to pass arguments into the constructor.
    // Again we might just have arguments under '0', '1' pipe into 
    // the constructor and set default readings to be equivalent
    // if(constructed && constructed.length == 0) constructed = undefined;
    altStates = altStates ? altStates : [];
    // if(constructed) assert(constructed.length === 1 + altStates.length);
    var main = Object.assign(new ProtoSubstance(), defaul, all);
    main.stateMap = new Map();
    var subs = [];
    subs.push(main);
    for (var _i = 0, altStates_1 = altStates; _i < altStates_1.length; _i++) {
        var alt = altStates_1[_i];
        var sub = Object.assign(new ProtoSubstance(), alt, all);
        subs.push(sub);
    }
    for (var _a = 0, subs_1 = subs; _a < subs_1.length; _a++) {
        var sub = subs_1[_a];
        main.stateMap.set(sub.state, sub);
    }
    main._getProtoSubstanceWithArgsOf = function (x) {
        var o = main.stateMap.get(x);
        return o === undefined ? main : o;
    };
    if (freeze) {
        for (var _b = 0, subs_2 = subs; _b < subs_2.length; _b++) {
            var x = subs_2[_b];
            Object.freeze(x);
        }
    }
    return main;
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
}
chemicals.set('H2', function () {
    var g = { state: "g" };
    var l = { state: "l",
        density: 70.85 }; // g/L
    var all = {
        chemicalFormula: 'H2',
        molarMass: 2.016,
        rgb: [250, 250, 255]
    };
    // g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;
    return chemicalFromJSON(all, g, [l]);
}());
chemicals.getNew = function (chem) {
    var formula = chem.formula;
    var atomt = chem.atomt;
    var all = {
        chemicalFormula: formula,
        molarMass: atomt.molarMass(),
        rgb: [250, 250, 250]
    };
    var phase = chem.state;
    if (!phase && atomt._atoms.length == 1) {
        // a substance comprised of a single atom
        var anum = atomt._atomicNums[0];
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
    }
    var state = { state: phase };
    var proto = chemicalFromJSON(all, state);
    chemicals.set(formula, proto);
    return proto;
};
