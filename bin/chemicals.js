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
