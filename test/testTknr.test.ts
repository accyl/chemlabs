/// <reference path="../src/command.ts"/>

/*
 Test functions:

 */

function testFormulaTknr() {
    let atomt = new NewAtomTracker();
    Tokenizers.formulaTknr('KMnO4', 0, atomt);
    test('atomt._atoms should be ["K", "Mn", "O"]', () => {
        expect(atomt._atoms).toBe(['K', 'Mn', 'O']);
        expect(atomt._qtys).toBe([1, 1, 4]);
    });

}