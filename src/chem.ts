// <reference path='phys/physold.ts'/>




class ChemicalType {
    // intrinsic, intensive properties go here like density
    density: number = 1; // g/mL
    specificHeatCapacity: number = 0; // J/(g-K)
    chemicalFormula = "";
    /** 
     * I was wrong. You can't use spectral data for only 3 specific wavelengths to predict rgb
     * */
    /*
    molar_absorptivity = [1, 1, 1]; */
    rgb: tup = [255, 255, 255];
    state = "g";
    static NONE = new ChemicalType();
    molarMass: number = -1;
    equals(x: any) {
        console.warn("unimplemented equals in chem.ts ChemicalType!");
        return this == x;
    }
}

class ProtoChemical extends ChemicalType{
    static NONE = new ProtoChemical();

    amt(qty: ComputedSubstQty, state?: string) {
        // let args = new PSArgs(this, qty);
        // if(state) args.state = state;
        if(state) qty.state = state;
        return qty.formFrom(this);
    }
    _getWithArgs(args: ComputedSubstQty): ProtoChemical {
        return this; // doesn't work right now
    }
    constructor() {
        super();
    }
    /**
     * Shortcut for getting one with default args
     * @returns 
     */
    form(): Substance {
        return new Substance(this);
    }

    static fromJson(all: any, defaul: JsonChemical, altStates?: JsonChemical[], freeze = true): ProtoChemical { //sObj?: any, lObj?: any, gObj?: any, aqObj?: any){
        // TODO
        // any such function that constructs from JSON must be able to customize the constructor
        // For example using a spectralA
        // maybe make that itself as a json option flag?
        // THen we need to pass arguments into the constructor.
        // Again we might just have arguments under '0', '1' pipe into 
        // the constructor and set default readings to be equivalent
        // if(constructed && constructed.length == 0) constructed = undefined;
        altStates = altStates ? altStates : [] as JsonChemical[];
        // if(constructed) assert(constructed.length === 1 + altStates.length);

        let main = Object.assign(new ProtoChemical(), defaul, all) as ProtoChemical & JsonChemical & { stateMap: any };
        main.stateMap = new Map() as Map<string, ProtoChemical>;

        let subs = [];
        subs.push(main);

        for (let alt of altStates) {
            let sub = Object.assign(new ProtoChemical(), alt, all);
            subs.push(sub);
        }
        for (let sub of subs) {
            main.stateMap.set(sub.state, sub);
        }
        main._getWithArgs = function (x) {
            let o = main.stateMap.get(x);
            return o === undefined ? main : o;
        }
        if (freeze) {
            for (let x of subs) {
                Object.freeze(x);
            }
        }
        return main;
    }
}
/*
class PSArgs {
    // Yeah I know it's messy but
    // there needs to be a way to construct substances with different states (of matter)
    // but which are otherwise completely identical
    // without triplicating of quadruplicating or septuplicating or whatever( ie. for ice)
    // I hope using a factory pattern will be somewhat better?
    ps: ProtoChemical;
    state?: string; // state of matter
    mol?: number;
    mass?: number;
    volmL?: number;
    molarity?: number;
    qul: QtyUnitList;
    constructor(ps: ProtoChemical, qty: QtyUnitList | QtyComputed) {
        this.ps = ps;        
        let computed;
        if(qty instanceof QtyUnitList) {
            computed = qty.computed();
            if(!(computed.mass||computed.mol||computed.vol)) computed.mol = 1; // set a default
        } else {
            computed = qty;
        }
        this.qul = computed.qul;
        if(computed) {
            this.mass = computed.mass; // mass, mol, and vol are the most vital stats.
            this.mol = computed.mol;
            if (computed.vol) this.volmL = computed.vol * 1000;
            else this.volmL = computed.vol;            
        }
        // magic inferral happens here
        if(this.state === undefined && this.molarity !== undefined) this.state = 'aq'; // ifwe get a Molarity reading (ie. 5M), assume aqueous
    }
    getProto(): ProtoChemical {
        return this.ps._getWithArgs(this);
    }
    form(): Substance {
        let ret = this.getProto().form();
        if(this.mass) ret.mass = this.mass;
        if(this.mol && ret instanceof MolecularSubstance) ret.mol = this.mol;
        if(this.volmL) ret.volume = this.volmL / 1000;
        return ret;
    }
}*/

/**
 * Coerce a substance into basically being a unit system
 * Not needed since Substances are already SubstGroups
 * @param x 
 * @deprecated
 */
function coerceToSystem(x: Substance | SubstGroup): SubstGroup {
    // if(!x) return undefined;
    let a = x as any;
    if ('substances' in x && 'equilibria' in x && 'subsystems' in x) return x;
    if ('substances' in x || 'equilibria' in x || 'subsystems' in x) throw "partially initialized substance/system hybrid: " + x;
    a['substances'] = [a];
    a['equilibria'] = [];
    a['subsystems'] = [];
    a.getSubstance = function () { return a; }
    return a;
}

class SubstGroup {
    static readonly BOUNDS_ONLY = new SubstGroup(); // pass this to newPhysicsHook to have a bounds-only physhook
    physhook?: PhysicsHook;

    substances: Substance[] = [];
    subsystems: SubstGroup[] = [];
    get s() { return this.substances; }
    getSubstance(key = 0) {
        return this.substances[key];
    }
    toString() {
        return `[${"" + this.substances}]`;
    }
}
/*
var handler = {
    get: function(target, name) {
        if (name in target) {
            return target[name];
        }
        if (name == 'length') {
            return Infinity;
        }
        return name * name;
    }
};
var p = new Proxy({}, handler);

p[4]; //returns 16, which is the square of 4.
*/
class Substance extends SubstGroup {
    // loc: Locatable = Locatable.NONE;
    physhook?: PhysicsHook;
    // add some stuff to coerce it into technically being a system with only 1 thing in it
    readonly substances: Substance[];
    readonly subsystems: SubstGroup[] = [];
    getSubstance(key: number) {return this;}
    // mol = 0; 
    get mass() {
        return this.type.density * this.volume;
    }
    set mass(mass:num) {
        this.volume = mass / this.type.density;
    }
    _v = 1;
    get volume() { // in mL
        return this._v;
    }
    set volume(volume) {
        this._v = volume;
    }
    _T = 273.15;
    get temperature() {
        return this._T;
    }
    set temperature(T) {
        this._T = T;
    }
    type: ChemicalType;
    state?: string; // State of Matter
    constructor(type?: ChemicalType) {
        super();
        this.type = type ? type : ChemicalType.NONE;
        this.state = type ? type.state : "";
        let a = [];
        a.push(this);
        this.substances = a;
    }
    color(background: tup = [255, 255, 255]): tup {
        return this.type.rgb;
    }
    hexcolor(background: tup = [255, 255, 255]): string {
        let c = this.color(background) as tup3;
        return _hex(...c);
    }
    toString() {
        return `${this.type.chemicalFormula} ${this.mass}g`;
    }
    isChemicalType(test: ChemicalType) {
        return this.type === test;
    }
    get kValue() { 
        // the REAL word for this is Thermodynamic activity: https://en.wikipedia.org/wiki/Thermodynamic_activity
        // See https://www.quora.com/In-an-equilibrium-with-both-gases-and-aqueous-solution-do-I-use-concentration-or-partial-pressure-of-the-gases-when-writing-the-expression-for-the-equilibrium-constant
        // https://chemistry.stackexchange.com/questions/133353/equilibrium-involving-both-gas-phase-and-aqueous-phase?
        // what this means that in many cases, concentration/pressure is only an estimate
        if ('kValue' in this) return (this as any).kValue;
        if ('pressure' in this) return (this as any).pressure; // a more accurate descriptor is FUGACITY
        if ('concentration' in this) return (this as any).concentration;
        return 1; // ignore
    }
    set kValue(kval: num) {
        if ('kValue' in this) (this as any).kValue = kval;
        if ('pressure' in this) (this as any).pressure = kval;
        if ('concentration' in this) (this as any).concentration = kval;
    }
}
function makeMolecular(s: Substance) {
    let molec = s as Substance & {molarMass: any, mol: any};
    Object.defineProperty(molec, 'molarMass', {
        get: function () { return molec.type.molarMass },
        set: function (x) { molec.type.molarMass = x }
    });
    molec['mol'] = 1;
    Object.defineProperty(molec, 'molarMass', {
        get: function () { return molec.mol * molec.molarMass },
        set: function (mass) { molec.mol = mass / molec!.molarMass }
    });
    return molec as MolecularSubstance;
}
class MolecularSubstance extends Substance {
    // molarMass = 1;
    // type2: MolecularSubstanceType;
    constructor(type: ChemicalType) {//MolecularSubstanceType) {
        super(type);
        // TODO Hacky dumb solution. THeoretically solvable by generics but I have to refactor a constructor & it's a headache
        // this.type2 = type;
    }
    get molarMass() {
        return this.type.molarMass;
    }
    set molarMass(s) {
        this.type.molarMass = s;
    }
    mol = 1;
    get mass() {
        return this.mol * this.molarMass;
    }
    set mass(mass) {
        this.mol = mass / this!.molarMass;
    }
}
function makeGaseous(x: MolecularSubstance) {
    assert('mol' in x, `${x} is somehow not a molecular substance?`);
        // how
    let gas = x as any;
    Object.defineProperty(gas, 'pressure', {
        get: function () { return this.mol * Constants.Ratm * this.temperature / this.volume }
        // set: function (x) { molec.type.molarMass = x }
    });
}
class GaseousSubstance extends MolecularSubstance{
    // PV=nRT
    // P = nRT/V
    get pressure() { // in atm
        return this.mol * Constants.Ratm * this.temperature / this.volume; 
    }
}

class AqueousSubstance extends MolecularSubstance {
    solvent: Substance;
    maxConcentration: num = Number.POSITIVE_INFINITY; // Also called the maximum solubility
    constructor(solutetype: ChemicalType, solvent: Substance) {
        super(solutetype);
        this.solvent = solvent;
    }
    get concentration() {
        return this.mol / (this.solvent.volume); // TODO: usually this.volume will be negligible.
    }
    set concentration(val) {
        // we probably can assume that they want to change mols, not volume
        if(val > this.maxConcentration) {
            // TODO supersaturated. Actually normally this would be 
            // solved using equilibria but it's not implemented yet
            // so let's just reject it for now
            return;
        }
        let molneeded = val * this.solvent.volume; 
        // we assume that the volume of solute is negligible
        // because technically molarity is volume of solution, not
        // volume of solvent
        this.mol = molneeded;
    }
    set volume(val: num) {
        // they probably want to change the solvent volume
        this.solvent.volume = val;
    }
    get volume() {
        return this.solvent.volume;
    }/*
    absorbance(length_traveled: num=1): tup {
        // A = ε * l * ç
        // ε = molar absorptivity
        // l = length traveled
        // ç = concentration
        // here we generalize molar_absorptivity
        return this.type.molar_absorptivity.map(x => x * length_traveled * this.concentration);
        // A = -log(T) = log(1/transmittance) = -log (transmittance) = -log(%light passing through / total light)
        // -A = log(T) T = 10^(-A)
    }
    transmittance(length_traveled: num=1): tup {
        return this.type.molar_absorptivity.map(x => Math.pow(10, -x * length_traveled * this.concentration / 100)); // / 100000));
    }
    color(background: tup = [255, 255, 255], l: num = 1) {
        return this.transmittance(l).map((x, i) => x * background[i]); // we assume that we're plotting it against a white
    }*/
}

class SpectralAqueousSubstance extends AqueousSubstance {
    spectra_f;
    constructor(solute: ChemicalType, solvent: Substance, spectra_f: (wl: num)=>num) {
        super(solute, solvent);
        this.spectra_f = spectra_f;

    }
    private _shortcut(x: num) {
            return f_daylight(x) * transmittance(this.spectra_f(x), this.concentration);
    }
    color(background: tup = [255, 255, 255], l: num = 1) {
        return rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration));
    }
}
