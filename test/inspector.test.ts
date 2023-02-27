/// <reference path="../src/dom/inspector.ts"/>

import { allKeys, allNewAttributes, cachedAttrs, traceExtensionsOn } from "../src/dom/inspector";
import { AqueousSubstance, ChemComponent, GaseousSubstance, makeGaseous, MolecularSubstance } from "../src/substance";

describe("tests the inspector class", function() {
    it("correctly picks up attributes of substances", () => {
        let h = new MolecularSubstance();
        expect(allNewAttributes(h)).toEqual(['mol', 'molarMass']);
        expect(allNewAttributes(new GaseousSubstance())).toEqual(['pressure']);
        expect(allNewAttributes(new(AqueousSubstance(h))())).toEqual(['solvent', 'concentration']);
        expect(cachedAttrs).toEqual(jasmine.objectContaining({
            ChemComponent: ["mass", "volume", "temperature", "state"],
            MolecularSubstance: ["mol", "molarMass"],
            AqueousSubstance: ["solvent", "concentration"],
            GaseousSubstance: ["pressure"]
        }));
        expect(allKeys(new ChemComponent())).toEqual(
            ['physhook', 'substances', 'subsystems', 'type', 'state', 'mass', 'volume', 'temperature', 'kValue', 's']);
    });
    it("dynamically walks the proto chain", function() {
        let h = new MolecularSubstance();

        expect(traceExtensionsOn(new(AqueousSubstance(h))()).map(x => x.name))
            .toEqual(['AqueousSubstance', 'MolecularSubstance']);
        expect(
                traceExtensionsOn(new(makeGaseous(AqueousSubstance(h)))()).map(x => x.name)
            )
            .toEqual(['GaseousSubstance', 'AqueousSubstance', 'MolecularSubstance']);
    });
});