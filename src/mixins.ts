// // Mixin sorcery. Better leave it untouched
// // we use mixins. see https://www.typescriptlang.org/docs/handbook/mixins.html

// import { f_daylight } from "./color/color";
// import { rgb_from_spectrum } from "./color/colormodels";
// import { transmittance } from "./color/colortest";
// import { toHex } from "./first";
// import { ChemComponent } from "./substance";

// // mixins are the canonical solution to multi-inheritance
// export type GMixin<T, A> = new (...args: A[]) => T;
// export type Mixin<T> = GMixin<T, any>;

// export interface MolecularSubstance extends ChemComponent {
//     molarMass: num;
//     mol: num;
// }
// export function makeMolecular<T extends Mixin<ChemComponent>>(s: T): Mixin<MolecularSubstance> & T {
//     return class MolecularSubstance extends s {
//         get molarMass() { return this.type.molarMass; }
//         set molarMass(m) { this.type.molarMass = m; }
//         mol = 1;
//         get mass(): number {
//             return this.mol * this.molarMass;
//         }
//         set mass(m: number) {
//             this.mol = this.mass / this.molarMass;
//         }
//     }
// }
// export const MolecularSubstance = makeMolecular(ChemComponent);
// export interface GaseousSubstance extends MolecularSubstance {
//     pressure: num;
// }
// export function makeGaseous<T extends Mixin<MolecularSubstance>>(x: T): Mixin<GaseousSubstance> & T {

//     return class GaseousSubstance extends x {
//         get pressure() { return this.mol * Constants.Ratm * this.temperature / this.volume }
//     }
// }
// export const GaseousSubstance = makeGaseous(MolecularSubstance);

// export interface AqueousSubstance {
//     solvent: ChemComponent;
//     concentration: num;
// }
// export function makeAqueous<T extends Mixin<MolecularSubstance>>(x: T, solventIn: ChemComponent): Mixin<AqueousSubstance> & T {
//     return class AqueousSubstance extends x {
//         solvent = solventIn;
//         get concentration() {
//             return this.mol / (this.solvent.volume); // TODO: assume the change of volume due to the solute is negligible.
//         }
//         set concentration(val) {
//             // we probably can assume that they want to change mols, not volume
//             // we assume that the volume of solute is negligible
//             // because technically molarity is volume of solution, not
//             // volume of solvent
//             // also in some cases adding solute can actually DECREASE volume of solution. see dissolution of nacl
//             this.mol = val * this.solvent.volume;
//         }
//         set volume(val: num) {
//             this.solvent.volume = val;
//         }
//         get volume() {
//             return this.solvent.volume;
//         }
//     }
// }
// export const AqueousSubstance = (solventIn: MolecularSubstance) => makeAqueous(MolecularSubstance, solventIn);
// export function makeSpectralAqueous<T extends Mixin<AqueousSubstance>>(x: T, spectra_fIn: (wl: num) => num): Mixin<AqueousSubstance> & T {
//     return class SpectralAqueousSubstance extends x {
//         spectra_f = spectra_fIn;
//         hexcolor(background: tup = [255, 255, 255], l: num = 1) {
//             return toHex(rgb_from_spectrum(x => f_daylight(x) * transmittance(this.spectra_f(x), this.concentration)));
//         }
//     }
// }