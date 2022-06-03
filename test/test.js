
let e = function () {
function assert(b=true) {
    if(!b) throw new ReferenceError();
}
function assertEq(ar, ar2) {//:any[], ar2: any[]) {
    assert(ar.length === ar2.length && !ar.some((x, i) => x != ar2[i]));
}
function _elems() {
    return gbdr.elemt._elems;
}
function _qtys() {
    return gbdr.elemt._qtys;
}
formulaTknr('CH3CH2CH2COOH');
    // !_bdr_glob.elemt._elems.some((x, i) => x != ["C", "H", "C", "H", "C", "H", "C", "O", "O", "H"][i])
assertEq(_elems(), ["C", "H", "C", "H", "C", "H", "C", "O", "O", "H"]);
    
assertEq(_qtys(), [1, 3, 1, 2, 1, 2, 1, 1, 1, 1]);
    // !_bdr_glob.elemt._qtys.some((x, i) => x != [1, 3, 1, 2, 1, 2, 1, 1, 1, 1][i])
// );
formulaTknr('KMnO4');

assertEq(_elems(), ['K', 'Mn', 'O']);

assertEq(_qtys(), [1,1,4]);
formulaTknr('H2O');
}();