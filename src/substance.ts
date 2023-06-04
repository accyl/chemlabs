// <reference path='phys/physold.ts'/>

// import { chemicals } from "./chemicals";

import { f_daylight } from "./color/color";
import { rgb_from_spectrum } from "./color/colormodels";
import { transmittance } from "./color/colortest";
import { ComputedQty } from "./command";
import { toHex } from "./first";
import { MolecularSubstance } from "./substances";
import { PhysicsHook } from "./phys";
import { absent, allAbsent, exactlyOneAbsent, forceDefaultsIfAbsent, ifOneAbsent, mergeInto, present, setMissingFieldsToNull } from "./calc";

// <reference path='cheminfoproxy.ts'/>
export class ChemType {
    // dependent on the state of the subst.
    // intrinsic, intensive properties go here like density
    id = "";
    canonical = "";

    density: field; // g/mL
    heat_capacity: field; // J/(g-K)
    formula = "";
    rgb='#FFFFFF'; // [255, 255, 255];
    state?: StateEnum = "g";
    molarMass: field;
    gibbs: field;
    enthalpy: field;
    entropy: field;

    static NONE = new ChemType();

    finalize(freeze=false) {
        if(freeze) Object.freeze(this);
    }
}
export type field = num | undefined | null; // | "UNK" | "DEP";
// convention: 
// undefined = unknown
// null = dependent variable

export interface IChemComponent {
    mass: field;
    volume: field;
    temperature: field;

    type: ChemType;
    state?: string;
}
export interface IChemComponentViewer extends IChemComponent{
    mass: num; // helper class that has the guaranteed to be non-undefined
    volume: num;
    temperature: num;
}
export class ChemComponent implements IChemComponent {

    static readonly BOUNDS_ONLY = new ChemComponent(); // pass this to newPhysicsHook to have a bounds-only physhook
    // ^ BOUNDS_ONLY is a psuedo-"null" physicshook
    physhook: PhysicsHook | undefined | false; // undefined: PhysicsHook missing. null: PhysicsHook purposely excluded.

    subcomponents: ChemComponent[] = [];


    // loc: Locatable = Locatable.NONE;
    // physhook?: PhysicsHook; already present in ChemComponents
    // add some stuff to coerce it into technically being a system with only 1 thing in it

    // mol = 0; 
    mass: field = 1;
    volume: field = 1;
    temperature: field = 273.15;
    type: ChemType;
    state?: StateEnum; // State of Matter
    constructor(type?: ChemType) {
        this.type = type ? type : ChemType.NONE;
        this.state = type ? type.state : "";
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
        return `${this.type.formula} ${this.mass}g`;
    }
    isChemicalType(test: ChemType) {
        return this.type === test;
    }
    

    calced = false;
    /**
     * Goal: calc() should be idempotent.
     * Note: in subclasses, extend forceCalc();
     * @param this 
     * @param targets 
     * @returns 
     */
    calc<T extends ChemComponent>(this: T, ...targets: string[]): T & IChemComponentViewer {
        if(!this.calced) {
            this.calced = true;
            return this.forceCalc(...targets);
        }
        return this as T & IChemComponentViewer;    
    }
    #densityBalance() {
        if (present(this.type.density)) {
            [this.mass, this.volume] = ifOneAbsent(
                [this.mass,
                this.volume],
                [this.type.density! * this.volume!,
                this.mass! / this.type.density!])
        }
    }
    forceCalc<T extends ChemComponent>(this: T, ...targets: string[]): T & IChemComponentViewer {
        console.log("calc(): TODO unimplemented!");

        this.#densityBalance();
        [this.mass, this.volume] = forceDefaultsIfAbsent(
            [this.mass, this.volume],
            [present(this.type.density) ? this.type.density! : 1, 1],
            ['mass' in targets, 'volume' in targets],
            this.#densityBalance);
        return this as T & IChemComponentViewer;
    }

    safeSet<T extends ChemComponent>(this: T, record: Partial<T>) {
        // TODO this is a bit of a mess
        // do this in the case
        // or even better set up equations that allow all of this boilerplate to be simplified
        // for example registerEquation('mass', 'volume', 'density', (m, v, d) => m * v / d - 1);
        if('mass' in record || 'volume' in record || 'mol') {
            // add mass and volume to record if they are not present, setting them to null
            setMissingFieldsToNull(record, null, 'mass', 'volume'); // we force volume to be recalculated upon a mass change, and vice versa
            mergeInto(this, record);
            this.#densityBalance();
            this.calced = true;
        }

    }
}
