// <reference path='phys/physold.ts'/>

class ChemicalIntrinsics {

}


class SubstanceType {
    // dependent on the state of the subst.
    // intrinsic, intensive properties go here like density
    density?: number; // g/mL
    specificHeatCapacity: number = 0; // J/(g-K)
    chemicalFormula = "";
    /** 
     * I was wrong. You can't use spectral data for only 3 specific wavelengths to predict rgb
     * */
    /*
    molar_absorptivity = [1, 1, 1]; */
    rgb: tup = [255, 255, 255];
    state = "g";
    static NONE = new SubstanceType();
    molarMass: number = -1;
    equals(x: any) {
        console.warn("unimplemented equals in chem.ts ChemicalType!");
        return this == x;
    }
}




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
    #m = 1;
    get mass() {
        return this.#m;
    }
    set mass(m: num) {
        this.#m = m;
    }
    #v = 1;
    get volume() { // in mL
        return this.#v;
    }
    set volume(volume) {
        this.#v = volume;
    }
    #T = 273.15;
    get temperature() {
        return this.#T;
    }
    set temperature(T) {
        this.#T = T;
    }
    type: SubstanceType;
    state?: string; // State of Matter
    constructor(type?: SubstanceType) {
        super();
        this.type = type ? type : SubstanceType.NONE;
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
    isChemicalType(test: SubstanceType) {
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
interface SubstanceConstructor {
    new(proto: SubstanceMaker): Substance;
}
class SubstanceMaker extends SubstanceType {
    static NONE = new SubstanceMaker();
    #statemap = new Map() as Map<string, SubstanceMaker>;
    standardState: SubstanceMaker;
    #substConstr: SubstanceConstructor;
    constructor(state?: string, standardState?: SubstanceMaker, constructor: SubstanceConstructor=Substance) {
        super();
        if (standardState) {
            this.standardState = standardState;
        } else {
            this.standardState = this;
        }
        if (state) {
            this.standardState.pushNewState(this, this.state);
            this.state = state;
        }
        this.#substConstr = constructor;
    }
    getStandardState(): SubstanceMaker {
        return this.standardState;
    }
    getWithArgs(args: ComputedQty | string): SubstanceMaker | undefined {
        let state = args instanceof ComputedQty ? args.state : args;
        let standard = this.getStandardState();
        if (state === standard.state) return standard;
        let ret = state ? this.getStandardState().#statemap.get(state) : undefined;
        return ret;
    }
    pushNewState(chemical: SubstanceMaker, condition: ComputedQty | string) {
        let state = condition instanceof ComputedQty ? condition.state : condition;
        if (state && this.getWithArgs(state) === undefined) {
            this.getStandardState().#statemap.set(state, chemical);
        }
    }

    amt(qty: ComputedQty, state?: string) {
        // let args = new PSArgs(this, qty);
        if (state) qty.state = state;
        return qty.formFrom(this);
    }
    // _getWithArgs(args: ComputedQty): ProtoChemical {
    //     return this; // doesn't work right now
    // }
    /**
     * Shortcut for getting one with default args
     * @returns 
     */
    form(): Substance {
        return new this.#substConstr(this);
    }

    static fromJson(all: any, defaul: JsonChemical, altStates?: JsonChemical[], freeze = true): SubstanceMaker { //sObj?: any, lObj?: any, gObj?: any, aqObj?: any){
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

        let main = Object.assign(new SubstanceMaker(), defaul, all) as SubstanceMaker & JsonChemical; // & { stateMap: any };
        // main.stateMap = new Map() as Map<string, ProtoChemical>;

        let subs = [];
        subs.push(main);

        for (let alt of altStates) {
            let sub = Object.assign(new SubstanceMaker(alt.state, main), alt, all);
            subs.push(sub);
        }
        for (let sub of subs) {
            main.pushNewState(sub, sub.state);
        }
        // main.stateMap.set(sub.state, sub);
        // main._getWithArgs = function (x) {
        //     let o = main.stateMap.get(x);
        //     return o === undefined ? main : o;
        // }
        if (freeze) {
            for (let x of subs) {
                Object.freeze(x);
            }
        }
        return main;
    }
}

// we use mixins. see https://www.typescriptlang.org/docs/handbook/mixins.html
type Mixin<T> = new (...args: any[]) => T;

interface MolecularSubstance extends Substance {
    molarMass: num;
    mol: num;
}
function makeMolecular<T extends Mixin<Substance>>(s: T) {
    return class MolecularSubstance extends s {
        get molarMass() { return this.type.molarMass; }
        set molarMass(m) { this.type.molarMass = m; }
        mol = 1;
        get mass(): number {
            return this.mol * this.molarMass;
        }
        set mass(m: number) {
            this.mol = this.mass / this.molarMass;
        }
    }
}
interface GaseousSubstance extends MolecularSubstance {
    pressure: num;
}
function makeGaseous<T extends Mixin<MolecularSubstance>>(x: T) {

    return class GaseousSubstance extends x {
        get pressure() { return this.mol * Constants.Ratm * this.temperature / this.volume }
    }
}

interface AqueousSubstance {
    solvent: Substance;
    concentration: num;
}
class AqueousSubstanceImpl extends makeMolecular(Substance) implements AqueousSubstance {
    solvent: Substance;
    constructor(solutetype: SubstanceType, solvent: Substance) {
        super(solutetype);
        this.solvent = solvent;
    }
    get concentration() {
        return this.mol / (this.solvent.volume); // TODO: usually this.volume will be negligible.
    }
    set concentration(val) {
        this.mol = val * this.solvent.volume;
    }
    set volume(val: num) {
        // they probably want to change the solvent volume
        this.solvent.volume = val;
    }
    get volume() {
        return this.solvent.volume;
    }
    /*
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
function makeAqueous<T extends Mixin<MolecularSubstance>>(x: T, solventIn: Substance) {
    return class AqueousSubstance extends x {
        solvent=solventIn;
        get concentration() {
            return this.mol / (this.solvent.volume); // TODO: assume the change of volume due to the solute is negligible.
        }
        set concentration(val) {
            // we probably can assume that they want to change mols, not volume
            // we assume that the volume of solute is negligible
            // because technically molarity is volume of solution, not
            // volume of solvent
            // also in some cases adding solute can actually DECREASE volume of solution. see dissolution of nacl
            this.mol = val * this.solvent.volume;
        }
        set volume(val: num) {
            this.solvent.volume = val;
        }
        get volume() {
            return this.solvent.volume;
        }
    }
}
function makeSpectralAqueous<T extends Mixin<AqueousSubstance>>(x: T, spectra_fIn: (wl: num) => num) {
    return class SpectralAqueousSubstance extends x {
        spectra_f = spectra_fIn;
        color(background: tup = [255, 255, 255], l: num = 1) {
            return rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration));
        }
    }
}
class SpectralAqueousSubstance extends AqueousSubstanceImpl {
    spectra_f;
    constructor(solute: SubstanceType, solvent: Substance, spectra_f: (wl: num)=>num) {
        super(solute, solvent);
        this.spectra_f = spectra_f;

    }
    color(background: tup = [255, 255, 255], l: num = 1) {
        return rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration));
    }
}
