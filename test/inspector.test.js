describe("tests the inspector class", function() {
    it("deduces new properties", function() {
        expect(allNewAttributes(MolecularSubstance, Substance)).toEqual(['mol']);
    });
});