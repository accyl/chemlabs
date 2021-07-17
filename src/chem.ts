/// <reference path='phys.ts'/>


class Constants {
    static R = 8.31446261815324; // (J)/(K-mol) = 
    static Ratm = 0.082057366080960; // (L-atm)/(K-mol)
}

class SubstanceType {
    // intrinsic, intensive properties go here like density
    density: number = 1; // g/mL
    specificHeatCapacity: number = 0; // J/(g-K)
    chemicalFormula = "";
    molar_absorptivity = [1, 1, 1]; // This is pretty cool. It gives us.
    // Problem - we aren't simulating the full absorptivity for the full spectrum of color?
    // Solution - we only need the absorptivity for red, green, and blue, since we assume 
    // that white light is an equal mix of red, green and blue, we just need the absorptivity of the
    // material in response to red, green and blue
    rgb: tup = [255, 255, 255];
    state = "g";
    static NONE = new SubstanceType();
    molarMass: number = -1;
}

class ProtoSubstance extends SubstanceType{
    static NONE = new ProtoSubstance();

    args(): ProtoSubstanceWithArgs {
        // I would have prefered the function name mitosis(), but unfortunately there's no easy verb form for mitosis
        let retn = new ProtoSubstanceWithArgs(this);
        return retn;
    }
    amt(qty: QtyUnitList | QtyBuilder) {
        let qbdr;
        if(qty instanceof QtyUnitList) {
            qbdr = qty.toBuilder();
        } else qbdr = qty;

        let ret = new ProtoSubstanceWithArgs(this);
        ret.mass = qbdr.mass;
        ret.mol = qbdr.mol;
        if(qbdr.volume) ret.volmL = qbdr.volume * 1000;
        else ret.volmL = qbdr.volume;
        return ret.form();
        // return ret;
    }
    _getProtoSubstanceWithArgsOf(args: ProtoSubstanceWithArgs): ProtoSubstance {
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
}

class ProtoSubstanceWithArgs {
    // Yeah I know it's messy but
    // there needs to be a way to construct substances with different states (of matter)
    // but which are otherwise completely identical
    // without triplicating of quadruplicating or septuplicating or whatever( ie. for ice)
    // I hope using a factory pattern will be somewhat better?
    ps: ProtoSubstance;
    state?: string; // state of matter
    constructor(ps: ProtoSubstance) {
        this.ps = ps;
    }
    gettype(): ProtoSubstance {
        let _ps = this.ps._getProtoSubstanceWithArgsOf(this);
        // let retn = Object.create(_ps);
        // Object.freeze(retn); // make it immutable
        return _ps;
    }
    form(): Substance {
        let ret = this.gettype().form();
        if(this.mass) ret.mass = this.mass;
        if(this.mol && ret instanceof MolecularSubstance) ret.mol = this.mol;
        if(this.volmL) ret.volume = this.volmL / 1000;
        return ret;
    }
    
    setState(stateOfMatter: string): ProtoSubstanceWithArgs {
        this.state = stateOfMatter;
        return this;
    }
    mol?: number;
    mass?: number;
    volmL?: number;
    /**
     * @deprecated
     * @param amt 
     * @returns 
     */
    amt(amt: number | string): ProtoSubstanceWithArgs {
        if(typeof amt == 'number') {
            // assume mol
            this.mol = amt;

        } else if(typeof amt == 'string'){
            amt = amt as string;
            let cut = undefined;
            if (amt.slice(-3) == 'mol') {
                amt = amt.slice(0, -3);
                if (amt.slice(-1) == ' ') amt = amt.slice(0, -1); // remove space
                this.mol = parseInt(amt);

            } else if ((cut = amt.slice(-2)) == 'mL' || cut == 'ml') {
                amt = amt.slice(0, -2);
                if (amt.slice(-1) == ' ') amt = amt.slice(0, -1); // remove space
                this.volmL = parseInt(amt);

            } else if ((cut = amt.slice(-1)) == 'g') {
                amt = amt.slice(0, -1);
                if (amt.slice(-1) == ' ') amt = amt.slice(0, -1); // remove space
                this.mass = parseInt(amt);

            } else if(cut == 'L' || cut == 'l') {
                amt = amt.slice(0, -2);
                if (amt.slice(-1) == ' ') amt = amt.slice(0, -1); // remove space
                this.volmL = parseInt(amt) * 1000;

            } 

        } else throw "amt isn't a str nor num";
        return this;
    }

}
function _componentToHex2(c: number) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function _rgbToHex(r: num, g: num, b: num) {
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}

// alert(rgbToHex(0, 51, 255)); // #0033ff

class Substance {
    // loc: Locatable = Locatable.NONE;
    physhook?: PhysicsHook = undefined;
    // mol = 0; 
    get mass() {
        return this.type.density * this.volume;
    }
    set mass(mass:num) {
        this.volume = mass / this.type.density;
    }
    _v = 0;
    get volume() { // in mL
        return this._v;
    }
    set volume(volume) {
        this._v = volume;
    }
    _T = 0;
    get temperature() {
        return this._T;
    }
    set temperature(T) {
        this._T = T;
    }
    type: SubstanceType;
    state?: string; // State of Matter
    kValue(): number {
        return 1; // returns the value used in the equilibrium expression. setting it to 1 will ignore it.
        // this is usually the molarity
    }
    constructor(type?: SubstanceType) {
        
        this.type = type ? type : SubstanceType.NONE;
        this.state = type ? type.state : "";
    }
    color(background: tup = [255, 255, 255]): tup {
        return this.type.rgb;
    }
    rgb(background: tup = [255, 255, 255]): string {
        let c = this.color(background) as tup3;
        return _rgbToHex(...c);
    }

}

class MolecularSubstance extends Substance {
    // molarMass = 1;
    // type2: MolecularSubstanceType;
    constructor(type: SubstanceType) {//MolecularSubstanceType) {
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

class GaseousSubstance extends MolecularSubstance{
    // PV=nRT
    // P = nRT/V
    get pressure() { // in atm
        return this.mol * Constants.Ratm * this.temperature / this.volume; 
    }
    kValue(): number {
        return this.pressure;
    }
}

class AqueousSubstance extends MolecularSubstance {
    solvent: Substance;
    constructor(solute: SubstanceType, solvent: Substance) {
        super(solute);
        this.solvent = solvent;
    }
    get concentration() {
        return this.mol / (this.solvent.volume); // TODO: usually this.volume will be negligible.
    }
    set concentration(val) {
        // we probably can assume that they want to change mols, not volume
        let molneeded = val * this.solvent.volume;
        this.mol = molneeded;
    }
    kValue() {
        return this.concentration;
    }
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
        return this.type.molar_absorptivity.map(x => Math.pow(10, -x * length_traveled * this.concentration));
    }
    color(background: tup = [255, 255, 255], l: num = 1) {
        return this.transmittance(l).map((x, i) => x * background[i]); // we assume that we're plotting it against a white
    }
}

class BalancedRxn {
    reactants: SubstanceType[] = [];
    products: SubstanceType[] = [];
    // constructor(reactants: SubstanceType[], products: SubstanceType[]) {
    //     this.reactants = reactants;
    //     this.products = products;
    // }
}

class EqbReaction extends BalancedRxn {
    constructor(K: number) {
        // TODO
        super();
        this.K = K;
    }
    K = 1;
}


class System {
    physhook: any = undefined;

    substances: Substance[] = [];
    get s() {return this.substances;}
    equilibria: EqbReaction[] = [];
    getSubstance(key: number) {
        return this.substances[key];
    }
    subsystems: System[] = [];
}
class SystemEquilibrium {
    sys: System;
    reactants: Substance[] = [];
    products: Substance[] = [];
    constructor(sys: System, eqb: EqbReaction) {
        this.sys = sys;
        for(let spec of sys.substances) {
            if(eqb.reactants.indexOf(spec.type) >= 0) { // if the equilibrium has the species as a reactant
                this.reactants.push(spec);
            } else if (eqb.products.indexOf(spec.type) >= 0) {
                this.products.push(spec);
            }
        }
    }
    get Q() {
        let Rs = 1;
        for(let rxt of this.reactants) {
            Rs *= rxt.kValue();
        }
        let Ps = 1;
        for(let px of this.products) {
            Ps *= px.kValue();
        }
        return Rs/Ps;
    }
    
}
