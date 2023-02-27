

namespace ChemInfo {
    export function initializeChemType(subst: ChemType & ChemExact) {
        let inchl = subst.inchl;
        throw new Error("Not implemented");
    }
    export function initializeChemPrototype(subst: ChemPrototype & ChemExact) {
        initializeChemType(subst);
        // TODO: initialize properties exclusive to ChemPrototype here
    }
}

