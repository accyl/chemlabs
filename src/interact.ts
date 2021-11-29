function kValue(subst: Substance) {
    // return subst.kValue();
    if ('kValue' in subst) return (subst as any).kValue;
    if('pressure' in subst) return (subst as any).pressure;
    if('concentration' in subst) return (subst as any).concentration;
    
    return 1; // ignore
}
class BalancedRxn {
    reactants: ChemicalType[] = [];
    products: ChemicalType[] = [];
}
class RateExpression {
    reactants: ChemicalType[] = [];
    powers: num[] = [];
    k: num = 1;
    R(orderedReactants: Substance[]) {
        assert(this.reactants.length == this.powers.length);
        let tot = 1;
        for (let i = 0; i < this.reactants.length; i++) {
            assert(orderedReactants[i].type.equals(this.reactants[i]));
            tot *= Math.pow(kValue(orderedReactants[i]), this.powers[i]);
        }
        return tot;
    }
}
type RateExpr = RateExpression;
class BoundRateExpr {
    parent: RateExpr;
    constructor(parent: RateExpr) {
        this.parent = parent;
    }
}
class Equilibrium extends BalancedRxn {

    // ΔG = nFE
    // ΔG = ΔH - TΔS
    // ΔG = ΔG° + RTlnQ
    // ΔG° = -RTlnK
    // K = exp(-RT/ΔG°)
    K = 1;
    constructor(K:num,rxt:ChemicalType[],px:ChemicalType[]) {
        super();
        this.K = K;
        this.reactants = rxt;
        this.products = px;
    }
    toJson() {
        return {'K': this.K, 'rx': this.reactants, 'px': this.products};
    }
    fromJson(x: {K:num,rx:ChemicalType[],px:ChemicalType[]}) {
        this.K = x.K;
        this.reactants = x.rx;
        this.products = x.px;
    }
    plugReactants(reactants: Substance[]) {
        let Rs = 1;
        for (let rxt of reactants) {
            Rs *= kValue(rxt);
        }
        return Rs;
    }
    plugProducts(products: Substance[]) {
        let Ps = 1;
        for (let px of products) {
            Ps *= kValue(px);
        }
        return Ps;
    }
    Q(reactants: Substance[], products: Substance[]) {
        return this.plugReactants(reactants) / this.plugProducts(products);
    }
    plug(all: Substance[]) {
        let rxt = [];
        let px = [];
        for (let subst of all) {
            if (this.reactants.includes(subst.type)) {

            }
        }
    }
}
type Eqb = Equilibrium;
/**
 * An object that represents both an equilibrium and a binding between real substances
 *  such that Q can be calculated without worrying about the ordering of reactants and products
 */
class BoundEqb {
    parent: Eqb;
    rx: Substance[] = [];
    px: Substance[] = [];
    constructor(parent: Eqb) {
        this.parent = parent;
    }
    bindRx(...sub: Substance[]) {
        this.rx.push(...sub);
    }
    bindPx(...sub: Substance[]) {
        this.px.push(...sub);
    }
    Q() {
        return this.parent.Q(this.rx, this.px);
    }
    get K() {
        return this.parent.K;
    }
}
class InteractionGroup {
    substs: Substance[] = [];
    eqbs: BoundEqb[] = [];
    constructor(eqbs: Equilibrium[]) {
        // TODO
    }
    step() {
        for(let eqb of this.eqbs) {

        }
    }
}

// class SystemEquilibrium {

    // reactants: ProtoChemical[] = [];
    // products: ProtoChemical[] = [];
    // K: num = 1;
    // sys: SubstGroup;
    // reactants: Substance[] = [];
    // products: Substance[] = [];
    // constructor(sys: SubstGroup, eqb: EqbReaction) {
    //     this.sys = sys;
    //     for(let spec of sys.substances) {
    //         if(eqb.reactants.indexOf(spec.type) >= 0) { // if the equilibrium has the species as a reactant
    //             this.reactants.push(spec);
    //         } else if (eqb.products.indexOf(spec.type) >= 0) {
    //             this.products.push(spec);
    //         }
    //     }
    // }

// }
