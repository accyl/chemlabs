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
    // aq.molar_absorptivity = [0.8, 1.75, 0.45];
    // aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
    aq.molar_absorptivity = [3160.68, 6913.98751, 1777.8825];
    aq.form = function () {
        return new AqueousSubstance(this, H2O.args().setState("l").amt("1 L").form());
    };
    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol
    Object.freeze(aq); // lock 
    return aq;
}();
