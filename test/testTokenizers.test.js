/// <reference path="../src/command.ts"/>

describe("Parenthesizer", function() {
    it("parenthesizes", function() {
        let [parens, newidx] = Tokenizers.parenthesizer("(this is a parenthetical) but this isn't", 0);
        expect(parens).toEqual("(this is a parenthetical)");
        expect(newidx).toEqual(25);
        expect(Tokenizers.parenthesizer("() empty", 0)).toEqual(["()", 2]);
        expect(() => Tokenizers.parenthesizer("Test message has incorrect (starting index)", 0)).toThrow();
        expect(Tokenizers.parenthesizer("this has an offset (parenthetical)", 19)).toEqual(["(parenthetical)", 34]);

    });
});

describe("Formula Tokenizer", function() {
    it("tracks KMnO4", function() {
        let atomt = new NewAtomTracker();
        Tokenizers.formulaTknr('KMnO4', 0, atomt);
        expect(atomt._atoms).toEqual(['K', 'Mn', 'O']);
        expect(atomt._qtys).toEqual([1, 1, 4]);
        expect(atomt._atomicNums).toEqual([19, 25, 8]);
        expect(atomt.molarMass()).toBeCloseTo(158.034);

    });

    it("distinguishes Co from CO, using test case CoCO3", function() {
        let atomt = new NewAtomTracker();
        Tokenizers.formulaTknr('CoCO3', 0, atomt);
        expect(atomt._atoms).toEqual(['Co', 'C', 'O']);
        expect(atomt._qtys).toEqual([1, 1, 3]);
        expect(atomt._atomicNums).toEqual([27, 6, 8]);

        expect(atomt.molarMass()).toBeCloseTo(118.94);

    });

    function molarMass(inp) {
        let atomt = new NewAtomTracker();
        Tokenizers.formulaTknr(inp, 0, atomt);
        return atomt.molarMass();
    }

    function expectMolarMass(x) {
        return expect(molarMass(x)).withContext(x);
    }
    it("calculates molar masses correctly", function() {
        expectMolarMass('KMnO4').toBeCloseTo(158.034);
        expectMolarMass('H2O').toBeCloseTo(18.015);
        expectMolarMass('O2').toBeCloseTo(32);
        expectMolarMass('C6H12O6').toBeCloseTo(180.16);

        expectMolarMass('NaHCO3').toBeCloseTo(84.007);


    });
    it("calculates molar masses correctly (polyatomic ions)", function() {

        // unimplemented
        expectMolarMass('Ca(OH)2').toBeCloseTo(74.093);
        expectMolarMass('Ca(OH)2').toEqual(molarMass('CaO2H2'));

    });
});