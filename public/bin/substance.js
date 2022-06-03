"use strict";
// <reference path='phys/physold.ts'/>
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _m, _v, _T, _statemap, _substConstr;
class SubstanceType {
    constructor() {
        this.specificHeatCapacity = 0; // J/(g-K)
        this.chemicalFormula = "";
        /**
         * I was wrong. You can't use spectral data for only 3 specific wavelengths to predict rgb
         * */
        /*
        molar_absorptivity = [1, 1, 1]; */
        this.rgb = [255, 255, 255];
        this.state = "g";
        this.molarMass = -1;
    }
    equals(x) {
        console.warn("unimplemented equals in chem.ts ChemicalType!");
        return this == x;
    }
}
SubstanceType.NONE = new SubstanceType();
/**
 * Coerce a substance into basically being a unit system
 * Not needed since Substances are already SubstGroups
 * @param x
 * @deprecated
 */
function coerceToSystem(x) {
    // if(!x) return undefined;
    let a = x;
    if ('substances' in x && 'equilibria' in x && 'subsystems' in x)
        return x;
    if ('substances' in x || 'equilibria' in x || 'subsystems' in x)
        throw "partially initialized substance/system hybrid: " + x;
    a['substances'] = [a];
    a['equilibria'] = [];
    a['subsystems'] = [];
    a.getSubstance = function () { return a; };
    return a;
}
class SubstGroup {
    constructor() {
        this.substances = [];
        this.subsystems = [];
    }
    get s() { return this.substances; }
    getSubstance(key = 0) {
        return this.substances[key];
    }
    toString() {
        return `[${"" + this.substances}]`;
    }
}
SubstGroup.BOUNDS_ONLY = new SubstGroup(); // pass this to newPhysicsHook to have a bounds-only physhook
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
    constructor(type) {
        super();
        this.subsystems = [];
        // mol = 0; 
        _m.set(this, 1);
        _v.set(this, 1);
        _T.set(this, 273.15);
        this.type = type ? type : SubstanceType.NONE;
        this.state = type ? type.state : "";
        let a = [];
        a.push(this);
        this.substances = a;
    }
    getSubstance(key) { return this; }
    get mass() {
        return __classPrivateFieldGet(this, _m);
    }
    set mass(m) {
        __classPrivateFieldSet(this, _m, m);
    }
    get volume() {
        return __classPrivateFieldGet(this, _v);
    }
    set volume(volume) {
        __classPrivateFieldSet(this, _v, volume);
    }
    get temperature() {
        return __classPrivateFieldGet(this, _T);
    }
    set temperature(T) {
        __classPrivateFieldSet(this, _T, T);
    }
    color(background = [255, 255, 255]) {
        return this.type.rgb;
    }
    hexcolor(background = [255, 255, 255]) {
        let c = this.color(background);
        return _hex(...c);
    }
    toString() {
        return `${this.type.chemicalFormula} ${this.mass}g`;
    }
    isChemicalType(test) {
        return this.type === test;
    }
    get kValue() {
        // the REAL word for this is Thermodynamic activity: https://en.wikipedia.org/wiki/Thermodynamic_activity
        // See https://www.quora.com/In-an-equilibrium-with-both-gases-and-aqueous-solution-do-I-use-concentration-or-partial-pressure-of-the-gases-when-writing-the-expression-for-the-equilibrium-constant
        // https://chemistry.stackexchange.com/questions/133353/equilibrium-involving-both-gas-phase-and-aqueous-phase?
        // what this means that in many cases, concentration/pressure is only an estimate
        if ('kValue' in this)
            return this.kValue;
        if ('pressure' in this)
            return this.pressure; // a more accurate descriptor is FUGACITY
        if ('concentration' in this)
            return this.concentration;
        return 1; // ignore
    }
    set kValue(kval) {
        if ('kValue' in this)
            this.kValue = kval;
        if ('pressure' in this)
            this.pressure = kval;
        if ('concentration' in this)
            this.concentration = kval;
    }
}
_m = new WeakMap(), _v = new WeakMap(), _T = new WeakMap();
function makeMolecular(s) {
    return class MolecularSubstance extends s {
        constructor() {
            super(...arguments);
            this.mol = 1;
        }
        get molarMass() { return this.type.molarMass; }
        set molarMass(m) { this.type.molarMass = m; }
        get mass() {
            return this.mol * this.molarMass;
        }
        set mass(m) {
            this.mol = this.mass / this.molarMass;
        }
    };
}
const MolecularSubstance = makeMolecular(Substance);
function makeGaseous(x) {
    return class GaseousSubstance extends x {
        get pressure() { return this.mol * Constants.Ratm * this.temperature / this.volume; }
    };
}
const GaseousSubstance = makeGaseous(MolecularSubstance);
function makeAqueous(x, solventIn) {
    return class AqueousSubstance extends x {
        constructor() {
            super(...arguments);
            this.solvent = solventIn;
        }
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
        set volume(val) {
            this.solvent.volume = val;
        }
        get volume() {
            return this.solvent.volume;
        }
    };
}
function makeSpectralAqueous(x, spectra_fIn) {
    return class SpectralAqueousSubstance extends x {
        constructor() {
            super(...arguments);
            this.spectra_f = spectra_fIn;
        }
        color(background = [255, 255, 255], l = 1) {
            return rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration));
        }
    };
}
class SubstanceMaker extends SubstanceType {
    constructor(state, standardState, constructor = MolecularSubstance) {
        super();
        _statemap.set(this, new Map());
        _substConstr.set(this, void 0);
        if (standardState) {
            this.standardState = standardState;
        }
        else {
            this.standardState = this;
        }
        if (state) {
            this.standardState.pushNewState(this, this.state);
            this.state = state;
        }
        __classPrivateFieldSet(this, _substConstr, constructor);
    }
    getStandardState() {
        return this.standardState;
    }
    getWithArgs(args) {
        let state = args instanceof ComputedQty ? args.state : args;
        let standard = this.getStandardState();
        if (state === standard.state)
            return standard;
        let ret = state ? __classPrivateFieldGet(this.getStandardState(), _statemap).get(state) : undefined;
        return ret;
    }
    pushNewState(chemical, condition) {
        let state = condition instanceof ComputedQty ? condition.state : condition;
        if (state && this.getWithArgs(state) === undefined) {
            __classPrivateFieldGet(this.getStandardState(), _statemap).set(state, chemical);
        }
    }
    /**
     * Makes a substance with the specifiied amount
     * @param qty
     * @param state
     * @returns
     */
    amount(qty, state) {
        // let args = new PSArgs(this, qty);
        if (state)
            qty.state = state;
        // return qty.formFrom(this);
        ///**
        let orig = this.getWithArgs(qty);
        if (orig === undefined) {
            // perhaps a state isn't set
            let atomTracker = new NewAtomTracker(this.getStandardState());
            atomTracker.state = this.state;
            orig = chemicals.saveCustom(atomTracker);
        }
        let ret = orig.form();
        if (qty.mass)
            ret.mass = qty.mass;
        if (qty.mol && 'mol' in ret)
            ret.mol = qty.mol;
        if (qty.vol)
            ret.volume = qty.vol;
        if (qty.state && !ret.state)
            ret.state = qty.state; // for custom
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
    form() {
        return new (__classPrivateFieldGet(this, _substConstr))(this);
    }
    static fromJson(all, defaul, altStates, freeze = true) {
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
        let main = Object.assign(new SubstanceMaker(), defaul, all); // & { stateMap: any };
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
_statemap = new WeakMap(), _substConstr = new WeakMap();
SubstanceMaker.NONE = new SubstanceMaker();
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
