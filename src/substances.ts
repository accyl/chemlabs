// Mixin sorcery. Better leave it untouched
// we use mixins. see https://www.typescriptlang.org/docs/handbook/mixins.html

import { forceDefaultsIfAbsent, ifOneAbsent, mergeInto, present, setMissingFieldsToNull } from "./calc";
import { f_daylight } from "./color/color";
import { rgb_from_spectrum } from "./color/colormodels";
import { transmittance } from "./color/colortest";
import { toHex } from "./first";
import { ChemComponent, ChemType, IChemComponent, IChemComponentViewer, field } from "./substance";

// mixins are the canonical solution to multi-inheritance

// export const UNK = "UNK"; // unknown
// export const DEP = "DEP"; // dependent variable

// helper class
export interface MolecularSubstanceViewer extends IChemComponentViewer {
    molarMass: num;
    mol: num;
}
export interface MolecularSubstance extends ChemComponent {
    molarMass: field ;
    mol: field;
    calc<T>(this: T, ...args: string[]): T & MolecularSubstanceViewer; 
}
function molBalance(self: MolecularSubstance) {
    if (present(self.type.molarMass)) {
        [self.mass, self.mol] = ifOneAbsent(
            [self.mass,
            self.mol],
            [self.type.molarMass! * self.mol!,
            self.mass! / self.type.molarMass!])
    }
}
export function makeMolecular<T extends ChemComponent>(s: T): MolecularSubstance & T {
    let s0 = s as MolecularSubstance & T;
    s0['mol'] = 1;
    let flag = present(s.type.molarMass);
    s0['molarMass'] = flag ? s.type.molarMass : undefined;
    s0['mass'] = flag ? s.type.molarMass : null;
    let superf = s0.forceCalc;
    s0.forceCalc = function <C extends ChemComponent>(this: C, ...targets: string[]) {
        superf.call(this, ...targets); // allow us to specify the "this" into the function
        molBalance(s0);
        return this as C & MolecularSubstanceViewer;
    }
    let superf2 = s0.safeSet;
    s0.safeSet = function <C extends ChemComponent>(this: C, record: Partial<C>) {
        if ('mass' in record || 'mol' in record) {
            // add mass and volume to record if they are not present, setting them to null
            setMissingFieldsToNull(record, null, 'mass', 'mol'); // force a recalculate if not present
            mergeInto(this, record);
            molBalance(s0);
            s0.calced = true;
        }
        superf2.call(this, record); 
        // we need to propogate both ways. Δ mol --> Δ mass, Δ mass --> Δ vol
        // but at the same time Δ vol --> Δ mass, Δ mass --> Δ mol
    }
    return s0;
}

export interface GaseousSubstanceViewer extends MolecularSubstanceViewer {
    pressure: num;
}
export interface GaseousSubstance extends MolecularSubstance {
    pressure: field;
    calc<T>(this: T, ...args: string[]): T & GaseousSubstanceViewer; 

}
export function makeGaseous<T extends MolecularSubstance>(x: T): GaseousSubstance & T {
    let s0 = (x as GaseousSubstance & T).calc('mol', 'temperature', 'volume');
    s0['pressure'] = s0.mol * Constants.Ratm * s0.temperature / s0.volume;
    return s0;
}

export interface AqueousSubstance {
    solvent: ChemComponent;
    concentration: field;
}
export function makeAqueous<T extends MolecularSubstance>(x: T, solventIn: ChemComponent): AqueousSubstance & T {
    let s0 = (x as AqueousSubstance & T).calc('mol', 'solvent.volume');
    s0['concentration'] = s0.mol / s0.solvent.volume!;
    s0['volume'] = s0.solvent.volume!;
    return s0;

}
export function makeSpectralAqueous<T extends AqueousSubstance & ChemComponent>(x: T, spectra_fIn: (wl: num) => num): AqueousSubstance & T {
    (x as any).spectra_f = spectra_fIn;
    x.hexcolor = function (background: string = "#FFFFFF") {
            return toHex(rgb_from_spectrum(x => f_daylight(x) * transmittance((x as any).spectra_f(x), this.concentration)));
    };
    return x;
    
}
export namespace Components {
    /**
     * Initializes molecular substance with molar mass specified in type, with these default values: 
     * mol: 1
     * mass: (dependent)
     * 
     * 
     * @param type 
     * @returns 
     */
    export function Molecular(type?: ChemType) {
        return makeMolecular(new ChemComponent(type));
    }
    export function Gaseous(type?: ChemType) {
        return makeGaseous(Molecular(type));
    }
    export function Aqueous(solute: ChemType | undefined, solventIn: MolecularSubstance) {
        return makeAqueous(Molecular(solute), solventIn);
    }
    export function SpectralAqueous(solute: ChemType | undefined, solventIn: MolecularSubstance, spectra_fIn: (wl: num) => num) {
        return makeSpectralAqueous(Aqueous(solute, solventIn), spectra_fIn);
    }

}