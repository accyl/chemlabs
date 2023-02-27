// <reference path='phys/physold.ts'/>

import { chemicals } from "./chemicals";
import { ChemInfo } from "./cheminfoproxy";
import { f_daylight } from "./color/color";
import { rgb_from_spectrum } from "./color/colormodels";
import { transmittance } from "./color/colortest";
import { ComputedQty } from "./command";
import { toHex } from "./first";
import { PhysicsHook } from "./phys";

// <reference path='cheminfoproxy.ts'/>
export class ChemType {
    exact: bool = false;
    // dependent on the state of the subst.
    // intrinsic, intensive properties go here like density
    id = -1;

    density?: number; // g/mL
    specificHeatCapacity: number = 0; // J/(g-K)
    chemicalFormula = "";
    rgb='#FFFFFF'; // [255, 255, 255];
    state = "g";
    molarMass: number = -1;

    static NONE = new ChemType();

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
export interface ChemExact {
    inchl: string;
}
export class ChemTypeExact extends ChemType implements ChemExact {
    inchl: string;
    constructor(inchl: string) {
        super();
        this.inchl = inchl;
        this.exact = true;
        // from 
        ChemInfo.initializeChemType(this);
    }
}


export class ChemComponents {
    static readonly BOUNDS_ONLY = new ChemComponents(); // pass this to newPhysicsHook to have a bounds-only physhook
    physhook?: PhysicsHook;

    substances: ChemComponent[] = [];
    subsystems: ChemComponents[] = [];
    get s() { return this.substances; }
    getSubstance(key = 0) {
        return this.substances[key];
    }
    toString() {
        return `[${"" + this.substances}]`;
    }
}

export class ChemComponent extends ChemComponents {
    // loc: Locatable = Locatable.NONE;
    // physhook?: PhysicsHook; already present in ChemComponents
    // add some stuff to coerce it into technically being a system with only 1 thing in it
    readonly substances: ChemComponent[];
    readonly subsystems: ChemComponents[] = [];
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
    type: ChemType;
    state?: string; // State of Matter
    constructor(type?: ChemType) {
        super();
        this.type = type ? type : ChemType.NONE;
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
    isChemicalType(test: ChemType) {
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
export interface SubstanceConstructor {
    new(proto: ChemPrototype): ChemComponent;
}


// Mixin sorcery. Better leave it untouched
// we use mixins. see https://www.typescriptlang.org/docs/handbook/mixins.html
export type GMixin<T, A> = new (...args: A[]) => T;
export type Mixin<T> = GMixin<T, any>;

export interface MolecularSubstance extends ChemComponent {
    molarMass: num;
    mol: num;
}
export function makeMolecular<T extends Mixin<ChemComponent>>(s: T): Mixin<MolecularSubstance> & T {
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
export const MolecularSubstance = makeMolecular(ChemComponent);
export interface GaseousSubstance extends MolecularSubstance {
    pressure: num;
}
export function makeGaseous<T extends Mixin<MolecularSubstance>>(x: T): Mixin<GaseousSubstance> & T{

    return class GaseousSubstance extends x {
        get pressure() { return this.mol * Constants.Ratm * this.temperature / this.volume }
    }
}
export const GaseousSubstance = makeGaseous(MolecularSubstance);

export interface AqueousSubstance {
    solvent: ChemComponent;
    concentration: num;
}
export function makeAqueous<T extends Mixin<MolecularSubstance>>(x: T, solventIn: ChemComponent): Mixin<AqueousSubstance> & T {
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
export const AqueousSubstance = (solventIn: MolecularSubstance) => makeAqueous(MolecularSubstance, solventIn);
export function makeSpectralAqueous<T extends Mixin<AqueousSubstance>>(x: T, spectra_fIn: (wl: num) => num): Mixin<AqueousSubstance> & T {
    return class SpectralAqueousSubstance extends x {
        spectra_f = spectra_fIn;
        hexcolor(background: tup = [255, 255, 255], l: num = 1) {
            return toHex(rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration)));
        }
    }
}

export class ChemPrototype extends ChemType {
    // static NONE = new ProtoSubstance();
    _statemap = new Map() as Map<string, ChemPrototype>;
    STPSelf: ChemPrototype;
    _substConstr: SubstanceConstructor;
    
    constructor(state: string, stpself?: ChemPrototype, constructor: SubstanceConstructor = MolecularSubstance) {
        super();
        this.STPSelf = stpself ? stpself : this; // default value for `stpself` is `this` if `stpself` is omitted.

        this.state = state;
        if (state !== '') {
            this.STPSelf.registerNonSTPSelf(this, state); 
            // ^ that function is a bit of a misnomer; it's ok if this = STPSelf. 
            // a better name would be pushNotNecessarilySTPSelf see the comments
        }
        this._substConstr = constructor;
    }
    getSTPSelf(): ChemPrototype {
        return this.STPSelf;
    }
    /**
     * This is a bit of a misnomer because
     * you can actually retrieve the STP self from this function.
     * What I mean is that you can get versions of the
     * substance itself that could be STP, but not necessarily.
     * A better name would be getNotNecessarilySTPSelf,
     * but that's a bit long.
     * @param args 
     * @returns 
     */
    getNonSTPSelf(args: ComputedQty | string): ChemPrototype | undefined {
        let state = args instanceof ComputedQty ? args.state : args;
        let standard = this.getSTPSelf();
        if (state === standard.state) return standard;
        let ret = state ? this.getSTPSelf()._statemap.get(state) : undefined;
        return ret;
    }

    registerNotNecessarilySTPSelf(chemical: ChemPrototype, condition: ComputedQty | string) {
        let state = condition instanceof ComputedQty ? condition.state : condition;
        let map = this.getSTPSelf()._statemap;
        if(state && !map.has(state)) {
            map.set(state, chemical);
        }
        // if (state && this.getNonSTPSelf(state) === undefined) {
        //     this.getSTPSelf()._statemap.set(state, chemical);
        // }
    }
    /**
     * This is quite a bit of a misnomer because
     * you are required to push the STP self to this function.
     * A better name would be pushNotNecessarilySTPSelf, 
     * but that is a bit of a mouthful.
     * @param args 
     * @returns 
     */
    registerNonSTPSelf = this.registerNotNecessarilySTPSelf;

    /**
     * Makes a substance with the specified amount
     * @param qty 
     * @param state 
     * @returns 
     */
    amount(qty: ComputedQty, state?: string) {
        // let args = new PSArgs(this, qty);
        if (state) qty.state = state;
        // return qty.formFrom(this);
        ///**
        let orig = this.getNonSTPSelf(qty);
        if(orig === undefined) {
            // perhaps a state isn't set
            // then we create a new substancemaker
            orig = chemicals.setWithNewState(this, state);
        }
        let ret = orig!.form(); // TODO bug?
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
    form(): ChemComponent {
        return new this._substConstr(this);
    }

    static fromJson(all: {}, defaul: JsonChemical, altStates?: JsonChemical[], freeze = true): ChemPrototype { //sObj?: any, lObj?: any, gObj?: any, aqObj?: any){
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

        let main = Object.assign(new ChemPrototype(defaul.state), defaul, all) as ChemPrototype & JsonChemical; // & { stateMap: any };
        // main.stateMap = new Map() as Map<string, ProtoChemical>;

        let subs = [];
        subs.push(main);

        for (let alt of altStates) {
            let sub = Object.assign(new ChemPrototype(alt.state, main), alt, all);
            subs.push(sub);
        }
        for (let sub of subs) {
            main.registerNonSTPSelf(sub, sub.state);
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

