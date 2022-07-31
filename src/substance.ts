// <reference path='phys/physold.ts'/>

class SubstanceType {
    // dependent on the state of the subst.
    // intrinsic, intensive properties go here like density
    id = -1;

    density?: number; // g/mL
    specificHeatCapacity: number = 0; // J/(g-K)
    chemicalFormula = "";
    /** 
     * I was wrong. You can't use spectral data for only 3 specific wavelengths to predict rgb
     * */
    /*
    molar_absorptivity = [1, 1, 1]; */
    rgb='#FFFFFF'; // [255, 255, 255];
    state = "g";
    static NONE = new SubstanceType();
    molarMass: number = -1;
    equals(x: any) {
        console.warn("unimplemented equals in chem.ts ChemicalType!");
        return this == x;
    }

    rarity?: number;

    finalize(freeze=false) {
        if(this.rarity === undefined) {
            if (['H2O', 'CO2', 'O2', 'H2', 'N2'].includes(this.chemicalFormula)) {
                this.rarity = 0;
            }
            if (this.chemicalFormula.length === 1) {
                this.rarity = 1; // monoatomic
            }
            if (this.chemicalFormula.length === 2 && '0' <= this.chemicalFormula[1] && this.chemicalFormula[1] <= '9') {
                this.rarity = 2; // diatomic or s8 or something simple
            }
            if (this.rarity === undefined) this.rarity = Math.sqrt(this.chemicalFormula.length) * Math.log10(Math.max(this.molarMass, 1)) + 2; // penalize complex molecules with many different atoms, and large molecules with high molar mass

        }
        if(freeze) Object.freeze(this);
    }
}


/**
 * Coerce a substance into basically being a unit system
 * Not needed since Substances are already SubstGroups
 * @param x 
 * @deprecated
 */
function coerceToSubstGroup(x: Substance | SubstGroup): SubstGroup {
    // if(!x) return undefined;
    let a = x as any;
    if ('substances' in x && 'subsystems' in x) return x;
    if ('substances' in x || 'subsystems' in x) throw "partially initialized substance/system hybrid: " + x;
    a['substances'] = [a];
    // a['equilibria'] = [];
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
    // color(background: tup = [255, 255, 255]): tup {
    //     return this.type.rgb;
    // }
    /**
     * Must return a css valid hex code color,
     * thus it must start with a '#' and then a hexadecimal color encoding
     * ie. #FFF839
     * @param background 
     * @returns 
     */
    hexcolor(background: string = '#FFFFFF'): string {
        // let c = this.color(background) as tup3;
        return this.type.rgb;
        // return _hex(...c);
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


// we use mixins. see https://www.typescriptlang.org/docs/handbook/mixins.html
type GMixin<T, A> = new (...args: A[]) => T;
type Mixin<T> = GMixin<T, any>;

interface MolecularSubstance extends Substance {
    molarMass: num;
    mol: num;
}
function makeMolecular<T extends Mixin<Substance>>(s: T): Mixin<MolecularSubstance> & T {
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
const MolecularSubstance = makeMolecular(Substance);
interface GaseousSubstance extends MolecularSubstance {
    pressure: num;
}
function makeGaseous<T extends Mixin<MolecularSubstance>>(x: T): Mixin<GaseousSubstance> & T{

    return class GaseousSubstance extends x {
        get pressure() { return this.mol * Constants.Ratm * this.temperature / this.volume }
    }
}
const GaseousSubstance = makeGaseous(MolecularSubstance);

interface AqueousSubstance {
    solvent: Substance;
    concentration: num;
}
function makeAqueous<T extends Mixin<MolecularSubstance>>(x: T, solventIn: Substance): Mixin<AqueousSubstance> & T {
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
const AqueousSubstance = (solventIn: MolecularSubstance) => makeAqueous(MolecularSubstance, solventIn);
function makeSpectralAqueous<T extends Mixin<AqueousSubstance>>(x: T, spectra_fIn: (wl: num) => num): Mixin<AqueousSubstance> & T {
    return class SpectralAqueousSubstance extends x {
        spectra_f = spectra_fIn;
        hexcolor(background: tup = [255, 255, 255], l: num = 1) {
            return _hex(rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration)));
        }
    }
}
class SubstanceMaker extends SubstanceType {
    static NONE = new SubstanceMaker();
    _statemap = new Map() as Map<string, SubstanceMaker>;
    standardState: SubstanceMaker;
    _substConstr: SubstanceConstructor;
    constructor(state?: string, standardState?: SubstanceMaker, constructor: SubstanceConstructor = MolecularSubstance) {
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
        this._substConstr = constructor;
    }
    getStandardState(): SubstanceMaker {
        return this.standardState;
    }
    getWithArgs(args: ComputedQty | string): SubstanceMaker | undefined {
        let state = args instanceof ComputedQty ? args.state : args;
        let standard = this.getStandardState();
        if (state === standard.state) return standard;
        let ret = state ? this.getStandardState()._statemap.get(state) : undefined;
        return ret;
    }
    pushNewState(chemical: SubstanceMaker, condition: ComputedQty | string) {
        let state = condition instanceof ComputedQty ? condition.state : condition;
        if (state && this.getWithArgs(state) === undefined) {
            this.getStandardState()._statemap.set(state, chemical);
        }
    }

    /**
     * Makes a substance with the specifiied amount
     * @param qty 
     * @param state 
     * @returns 
     */
    amount(qty: ComputedQty, state?: string) {
        // let args = new PSArgs(this, qty);
        if (state) qty.state = state;
        // return qty.formFrom(this);
        ///**
        let orig = this.getWithArgs(qty);
        if(orig === undefined) {
            // perhaps a state isn't set
            // then we create a new substancemaker
            orig = chemicals.createMakerFromQty(qty, this);
        }
        let ret = orig.form();
        if (qty.mass) ret.mass = qty.mass;
        if (qty.mol && 'mol' in ret) (ret as MolecularSubstance).mol = qty.mol;
        if (qty.vol) ret.volume = qty.vol;
        if (qty.state && !ret.state) ret.state = qty.state; // for custom
        return ret;
        // */
    }
    // _getWithArgs(args: ComputedQty): ProtoChemical {
    //     return this; // doesn't work right now
    // }
    /**
     * Shortcut for getting one with default args
     * @returns 
     */
    form(): Substance {
        return new this._substConstr(this);
    }

    static fromJson(all: {}, defaul: JsonChemical, altStates?: JsonChemical[], freeze = true): SubstanceMaker { //sObj?: any, lObj?: any, gObj?: any, aqObj?: any){
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
        for (let x of subs) {
            x.finalize(freeze);
        }
        
        return main;
    }
}
// class AqueousSubstanceImpl extends makeMolecular(Substance) implements AqueousSubstance {
//     solvent: Substance;
//     constructor(solutetype: SubstanceType, solvent: Substance) {
//         super(solutetype);
//         this.solvent = solvent;
//     }
//     get concentration() {
//         return this.mol / (this.solvent.volume); // TODO: usually this.volume will be negligible.
//     }
//     set concentration(val) {
//         this.mol = val * this.solvent.volume;
//     }
//     set volume(val: num) {
//         // they probably want to change the solvent volume
//         this.solvent.volume = val;
//     }
//     get volume() {
//         return this.solvent.volume;
//     }
//     /*
//     absorbance(length_traveled: num=1): tup {
//         // A = ε * l * ç
//         // ε = molar absorptivity
//         // l = length traveled
//         // ç = concentration
//         // here we generalize molar_absorptivity
//         return this.type.molar_absorptivity.map(x => x * length_traveled * this.concentration);
//         // A = -log(T) = log(1/transmittance) = -log (transmittance) = -log(%light passing through / total light)
//         // -A = log(T) T = 10^(-A)
//     }
//     transmittance(length_traveled: num=1): tup {
//         return this.type.molar_absorptivity.map(x => Math.pow(10, -x * length_traveled * this.concentration / 100)); // / 100000));
//     }
//     color(background: tup = [255, 255, 255], l: num = 1) {
//         return this.transmittance(l).map((x, i) => x * background[i]); // we assume that we're plotting it against a white
//     }*/

// }
// class SpectralAqueousSubstance extends AqueousSubstanceImpl {
//     spectra_f;
//     constructor(solute: SubstanceType, solvent: Substance, spectra_f: (wl: num)=>num) {
//         super(solute, solvent);
//         this.spectra_f = spectra_f;

//     }
//     color(background: tup = [255, 255, 255], l: num = 1) {
//         return rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration));
//     }
// }
