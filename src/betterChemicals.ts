

class RigorousChemicalID {
    cas?: string;
}
type ChemicalID = RigorousChemicalID;
class ChemicalRetriever {
    byCAS(cas: string): RigorousChemicalID {
        throw new Error("Not implemented");
    }
    byName(bestName: string): RigorousChemicalID {
        throw new Error("Not implemented");
    }
    bySMILES(smiles: string): RigorousChemicalID {
        throw new Error("Not implemented");
    }

}
abstract class ChemicalInformatics {
    abstract density(cid: ChemicalID): number;
    abstract specificHeatCapacity(cid: ChemicalID): number;
    abstract chemicalFormula(cid: ChemicalID): string;
    /**
     * average rgb value of the chemical. used for color-coding or "low-res" display
     * @param cid 
     */
    abstract rgb(cid: ChemicalID): string;
    abstract state(cid: ChemicalID): string;
    abstract molarMass(cid: ChemicalID): number;
    

}