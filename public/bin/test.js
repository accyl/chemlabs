"use strict";
// rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
function assert(b) {
    if (!b)
        throw "assertion failed";
}
formulaTknr('CH3CH2CH2COOH');
assert(_bdr_glob.elemt._elems === ["C", "H", "C", "H", "C", "H", "C", "O", "O", "H"] && _bdr_glob.elemt._qtys === [1, 3, 1, 2, 1, 2, 1, 1, 1, 1]);
formulaTknr('KMnO4');
assert(_bdr_glob.elemt._elems === ["K", "Mn", "O"] && _bdr_glob.elemt._qtys === [1, 1, 4]);
formulaTknr('H2O');
