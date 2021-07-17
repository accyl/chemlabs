/// <reference path='chem.ts'/>
const H2O = function() {
    let g = new ProtoSubstance();
    g.state = "g";
    g.specificHeatCapacity = 2.080;

    let l = new ProtoSubstance();
    l.state = "l";
    l.density = 0.9998395;
    l.specificHeatCapacity = 4.184;

    let s = new ProtoSubstance();
    s.state = "s";
    s.density = 0.9168; // ice
    s.specificHeatCapacity = 2.05;

    g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
    g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;

    g._getProtoSubstanceWithArgsOf = function(args: ProtoSubstanceWithArgs): ProtoSubstance {
        if(args.state === "s") return s;
        if (args.state === "l") return l;
        if (args.state === "g") return g;
        return ProtoSubstance.NONE;

    }

    Object.freeze(g);
    Object.freeze(l);
    Object.freeze(s);

    return g;
}();
const KMnO4 = function() {
    // molar mass: 158.033949
    let aq = new ProtoSubstance();
    // me.stateOfMatter = "s"; // TODO this feels dumb
    aq.state = "aq";
    // aq.molar_absorptivity = [0.8, 1.75, 0.45];
    // aq.molar_absorptivity = [2042.60286, 3341.11468, 1167.20163];
    aq.molar_absorptivity = [3160.68,6913.98751,1777.8825];
    aq.form = function() {
        return new AqueousSubstance(this, H2O.args().setState("l").amt("1 L").form());
    };


    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol
    
    Object.freeze(aq); // lock 
    return aq;
}();
// old method above
// new method below

const chemicals = new Map() as Map<string, ProtoSubstance>;
chemicals.set('H2O', function(){
    let g = new ProtoSubstance();
    g.state = "g";
    g.specificHeatCapacity = 2.080;

    let l = new ProtoSubstance();
    l.state = "l";
    l.density = 0.9998395;
    l.specificHeatCapacity = 4.184;

    let s = new ProtoSubstance();
    s.state = "s";
    s.density = 0.9168; // ice
    s.specificHeatCapacity = 2.05;

    g.chemicalFormula = l.chemicalFormula = s.chemicalFormula = "H2O";
    g.molarMass = l.molarMass = s.molarMass = 18.01528; // g/mol;

    g._getProtoSubstanceWithArgsOf = function (args: ProtoSubstanceWithArgs): ProtoSubstance {
        if (args.state === "s") return s;
        if (args.state === "l") return l;
        if (args.state === "g") return g;
        return ProtoSubstance.NONE;

    }

    Object.freeze(g);
    Object.freeze(l);
    Object.freeze(s);

    return g;
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
        return new AqueousSubstance(this, w("H2O 1L")); // H2O.args().setState("l").amt("1 L").form());
    };

    aq.chemicalFormula = "KMnO4";
    aq.molarMass = 158.034; // g/mol

    Object.freeze(aq); // lock 
    return aq;
}());