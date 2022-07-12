"use strict";
/// <reference path="../src/command.ts"/>
describe("Whitespace Tokenizer", function () {
    it("strips whitespace", function () {
        expect(Tokenizers.whitespaceTokenizer("    removes preceding whitespace", 0)).toEqual(["    ", 4]);
    });
});
describe("Parenthesizer", function () {
    it("parenthesizes", function () {
        let [parens, newidx] = Tokenizers.parenthesizer("(this is a parenthetical) but this isn't", 0);
        expect(parens).toEqual("(this is a parenthetical)");
        expect(newidx).toEqual(25);
        expect(Tokenizers.parenthesizer("() empty", 0)).toEqual(["()", 2]);
        expect(() => Tokenizers.parenthesizer("Test message has incorrect (starting index)", 0)).toThrow();
        expect(Tokenizers.parenthesizer("this has an offset (parenthetical)", 19)).toEqual(["(parenthetical)", 34]);
    });
});
describe("Formula Tokenizer", function () {
    it("tracks KMnO4 and butanoic acid", function () {
        let atomt = new AtomTracker();
        Tokenizers.formulaTokenizer('KMnO4', 0, atomt);
        expect(atomt.atoms).toEqual(['K', 'Mn', 'O']);
        expect(atomt.qtys).toEqual([1, 1, 4]);
        expect(atomt.atomicNums).toEqual([19, 25, 8]);
        expect(atomt.molarMass()).toBeCloseTo(158.034);
        atomt = new AtomTracker();
        Tokenizers.formulaTokenizer('CH3CH2CH2COOH', 0, atomt);
        expect(atomt.atoms).toEqual(["C", "H", "C", "H", "C", "H", "C", "O", "O", "H"]);
        expect(atomt.qtys).toEqual([1, 3, 1, 2, 1, 2, 1, 1, 1, 1]);
    });
    it("distinguishes Co from CO, using test case CoCO3", function () {
        let atomt = new AtomTracker();
        Tokenizers.formulaTokenizer('CoCO3', 0, atomt);
        expect(atomt.atoms).toEqual(['Co', 'C', 'O']);
        expect(atomt.qtys).toEqual([1, 1, 3]);
        expect(atomt.atomicNums).toEqual([27, 6, 8]);
        expect(atomt.molarMass()).toBeCloseTo(118.94);
    });
    function molarMass(inp) {
        let atomt = new AtomTracker();
        Tokenizers.formulaTokenizer(inp, 0, atomt);
        return atomt.molarMass();
    }
    function expectMolarMass(x) {
        return expect(molarMass(x)).withContext(x);
    }
    it("calculates molar masses", function () {
        expectMolarMass('KMnO4').toBeCloseTo(158.034);
        expectMolarMass('H2O').toBeCloseTo(18.015);
        expectMolarMass('O2').toBeCloseTo(32);
        expectMolarMass('C6H12O6').toBeCloseTo(180.16);
        expectMolarMass('NaHCO3').toBeCloseTo(84.007);
        expect(new AtomTracker('NaHCO3').molarMass()).toBeCloseTo(84.007);
    });
    it("calculates molar masses for polyatomic ions", function () {
        // unimplemented
        expectMolarMass('Ca(OH)2').toBeCloseTo(74.093);
        expectMolarMass('Ca(OH)2').toBeCloseTo(molarMass('CaO2H2'));
        expectMolarMass('Pb(NO3)2').toBeCloseTo(331.21, 1);
        expectMolarMass('(NH4)2(HPO4)').toBeCloseTo(132.06, 1);
    });
});
describe("Quantities Tokenizer", function () {
    it("tokenizes quantities", function () {
        let [str1, num1, obj1] = Tokenizers.quantitiesTokenizer("6 mol 7 mL 400K", 0);
        '';
        expect([str1, num1]).toEqual(['6 mol 7 mL 400K', 15]);
        expect(obj1).toEqual(jasmine.objectContaining({ qtys: [6, 7, 400], si_prefixes: ['', 'm', ''], units: ['mol', 'L', 'K'] }));
        expect(Tokenizers.quantitiesTokenizer("69 V 13ms 797  kg 420atm", 0)[2])
            .toEqual(jasmine.objectContaining({ qtys: [69, 13, 797, 420], si_prefixes: ['', 'm', 'k', ''], units: ['V', 's', 'g', 'atm'] }));
        expect(Tokenizers.quantitiesTokenizer("8yhyhyhyh", 0)[2])
            .toEqual(jasmine.objectContaining({ qtys: [], si_prefixes: [], units: [] }));
        expect(Tokenizers.quantitiesTokenizer("H2O 5mL", 0)[2])
            .toEqual(jasmine.objectContaining({ qtys: [], si_prefixes: [], units: [] }));
        expect(Tokenizers.quantitiesTokenizer("5mol H2O 6mL", 0)[2])
            .toEqual(jasmine.objectContaining({ qtys: [5], si_prefixes: [''], units: ['mol'] }));
    });
});
