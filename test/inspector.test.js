/// <reference path="../src/dom/inspector.ts"/>

describe("tests the inspector class", function() {
    it("correctly picks up attributes of substances", () => {
        expect(allNewAttributes(new MolecularSubstance())).toEqual(['mol', 'molarMass']);
        expect(allNewAttributes(new GaseousSubstance())).toEqual(['pressure']);
        expect(allNewAttributes(new(AqueousSubstance())())).toEqual(['solvent', 'concentration']);
        expect(cachedAttrs).toEqual(jasmine.objectContaining({
            Substance: ["mass", "volume", "temperature", "state"],
            MolecularSubstance: ["mol", "molarMass"],
            AqueousSubstance: ["solvent", "concentration"],
            GaseousSubstance: ["pressure"]
        }));
        expect(allKeys(new Substance())).toEqual(
            ['substances', 'subsystems', 'type', 'state', 'mass', 'volume', 'temperature', 'kValue', 's']);
    });
    it("dynamically walks the proto chain", function() {


        expect(traceExtensionsOn(new(AqueousSubstance())()).map(x => x.name))
            .toEqual(['AqueousSubstance', 'MolecularSubstance']);
        expect(
                traceExtensionsOn(new(makeGaseous(AqueousSubstance()))()).map(x => x.name)
            )
            .toEqual(['GaseousSubstance', 'AqueousSubstance', 'MolecularSubstance']);
    });
});