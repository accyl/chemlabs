
class RateExpression {
    reactants: SubstanceType[] = [];
    powers: num[] = [];
    k: num = 1; // rate 
    R(orderedReactants: Substance[]) {
        assert(orderedReactants.length === this.reactants.length && this.reactants.length == this.powers.length);
        let tot = 1;
        for (let i = 0; i < this.reactants.length; i++) {
            assert(orderedReactants[i].isChemicalType(this.reactants[i]));
            tot *= Math.pow(orderedReactants[i].kValue, this.powers[i]);
        }
        return tot;
    }
}
type RateExpr = RateExpression;
class BoundRateExpr extends RateExpression{
    brx: Substance[] = [];
    constructor(k: num, rxt: SubstanceType[]) {
        super();
        this.reactants = rxt;
        this.k = k;
    }
    bindReactants(...sub: Substance[]) {
        this.brx.push(...sub);
    }
    R() {
        return super.R(this.brx);
    }
}
class BalancedRxn {
    reactants: SubstanceType[] = [];
    products: SubstanceType[] = [];
    coefficients: num[] = []; // reactants, then products
    constructor(rxt: SubstanceType[], px: SubstanceType[], coeff: num[]) {
        this.reactants = rxt;
        this.products = px;
        this.coefficients = coeff;
    }
    chemicalEntry(index: num): [SubstanceType, num] {
        let chem = index >= this.reactants.length ? this.products[index - this.reactants.length] : this.reactants[index];
        let coeff = this.coefficients[index];
        return [chem, coeff];
    }
    forEach(callback: (chem: SubstanceType, coeff: num)=> void) {
        this.forEachReactant(callback);
        this.forEachProduct(callback);
        
    }
    forEachReactant(callback: (chem: SubstanceType, coeff: num) => void) {
        let i = 0;
        for (; i < this.reactants.length; i++) {
            callback(this.reactants[i], this.coefficients[i]);
        }
    }
    forEachProduct(callback: (chem: SubstanceType, coeff: num) => void) {
        let j = 0;
        for (; j < this.products.length; j++) {
            callback(this.products[j], this.coefficients[j + this.reactants.length]);
        }
    }
    
}
class Equilibrium extends BalancedRxn {

    // ΔG = nFE
    // ΔG = ΔH - TΔS
    // ΔG = ΔG° + RTlnQ
    // ΔG° = -RTlnK
    // K = exp(-RT/ΔG°)
    // Ecell = Ecell° - RT/(nF)*lnQ
    K = 1;
    constructor(rxt: SubstanceType[], px: SubstanceType[], coeff: num[], K: num) {
        super(rxt, px, coeff);
        this.K = K;
    }
    toJson() {
        return {'K': this.K, 'rx': this.reactants, 'px': this.products, 'coeff': this.coefficients};
    }
    static fromJson(x: {K:num, rx:SubstanceType[], px:SubstanceType[], coeff:num[]}) {
        return new Equilibrium(x.rx, x.px, x.coeff, x.K);
    }
    plugReactants(reactants: Substance[]) {
        let Rs = 1;
        for (let i=0;i<reactants.length;i++) {
            let rxt = reactants[i];
            let coeff = this.coefficients[i];
            Rs *= Math.pow(rxt.kValue, coeff);
        }
        return Rs;
    }
    plugProducts(products: Substance[]) {
        let Ps = 1;
        let offset = this.reactants.length;
        for (let i = 0; i < products.length; i++) {
            let px = products[i];
            let coeff = this.coefficients[offset + i];
            Ps *= Math.pow(px.kValue, coeff);
        }
        return Ps;
    }
    Q(reactants: Substance[], products: Substance[]) {
        return this.plugReactants(reactants) / this.plugProducts(products);
    }
    /**
     * @param all Input substances
     * @returns The input substances get split into reactants and products, respectively
     */
    partition(all: Substance[]): [Substance[], Substance[]] {
        let rxt = [];
        let px = [];
        for (let subst of all) {
            let inrx = this.reactants.includes(subst.type);
            let inpx = this.products.includes(subst.type);
            if (inrx === inpx) continue; // if a substance is in neither or it's in both, ignore
            if(inrx) rxt.push(subst);
            if(inpx) px.push(subst);
        }
        return [rxt, px];
    }
    plug(all: Substance[]) {
        this.Q(...this.partition(all));
    }

}
type Eqb = Equilibrium;
/**
 * An object that represents both an equilibrium and a binding between real substances
 *  such that Q can be calculated without worrying about the ordering of reactants and products
 */
class BoundEqb {
    eqb: Eqb;
    brx: Substance[] = [];
    bpx: Substance[] = [];
    constructor(eqb: Eqb) {
        this.eqb = eqb;
    }
    get K() {
        return this.eqb.K;
    }
    // constructor(K: num, rxt: ChemicalType[], px: ChemicalType[]) {
    //     super(K, rxt, px);
    // }
    bindReactants(...sub: Substance[]) {
        this.brx.push(...sub);
    }
    bindProducts(...sub: Substance[]) {
        this.bpx.push(...sub);
    }
    bind(all: Substance[]) {
        let [rx, px] = this.eqb.partition(all);
        this.bindReactants(...rx);
        this.bindProducts(...px);
    }
    get Q() {
        // todo CACHE
        return this.eqb.Q(this.brx, this.bpx);
    }
    effectiveRate = 0; // this rate is the forwardRate - backwardRate
    /**
     * 
     * @param fractionMin what fraction of the LR we should expecct in this step. 
     * @param exactr the exact number of moles of reactions to proceed. 
     * if exactr is provided, and there is insufficient reagent to react,
     * exactr will automatically be rounded down to minr.
     * This is because we must ensure exactr * coeff > LR, and that we will not deplete (or turn negative) the LR.
     *     
     * @param forward
     * @returns size of step taken
     */
    step(fractionMin = 0.5, exactr?:num, forward?:boolean): number {
        if(forward === undefined) {
            if (this.Q === this.K) return 0; // don't step if we're already at eqb
            forward = this.Q < this.K;
        }
        // let deduct = forward ? this.brx : this.bpx; // if it's forward, then deduct from reactants. otherwise, deduct from products
        let minr = Number.POSITIVE_INFINITY;
        let eqb = this.eqb;
        let findLR = function (chem: Substance, coeff: num) {
            minr = Math.min(minr, chem.kValue / eqb.coefficients[coeff]);
        }; // finds the limit reagent
        if (forward) {
            this.forEachReactant(findLR);
        } else {
            this.forEachProduct(findLR);
        }
        let numr: num; // number of moles of reactions to proceed.
        if(exactr !== undefined) {
            numr = Math.min(exactr, minr);
        } else {
            numr = fractionMin * minr;
        }
        if(numr === Number.POSITIVE_INFINITY) {
            // then there IS NO LR so any numr should be fine
            numr = 0; // we set it to 0 just to be safe
        }
        if(forward) {
            this.forEachReactant((chem, coeff) => chem.kValue -= numr! * coeff); // deduct reactants
            this.forEachProduct((chem, coeff) => chem.kValue += numr! * coeff); // add to products
        } else { // backward
            this.forEachProduct((chem, coeff) => chem.kValue -= numr! * coeff); // deduct products
            this.forEachReactant((chem, coeff) => chem.kValue += numr! * coeff); // add to reactants
        }
        return numr;
    }
    autoeqb(maxerror=0.1, maxtries=100) { // error squared
        let prevdir = this.Q < this.K;
        let dir = prevdir;
        let stepsize = this.step(0.5, undefined, dir); // initial step is half of minstep
        
        let error = Math.abs(this.Q - this.K);
        let tries = 0;
        dir = this.Q < this.K;
        while (error > maxerror) {
            if (stepsize == 0 || tries > maxtries) {
                console.warn(`Preventatively aborting out of infinite loop? stepsize: ${stepsize} tries: ${tries} system: ${this}`)
                break; // try to prevent infinite loops
            }
            this.step(undefined, stepsize, dir);
            let Q = this.Q; // cache the computationally expensive Q
            prevdir = dir;
            dir = Q < this.K; // update direction

            error = Math.abs(Q - this.K);
            if(prevdir !== dir) {
                // if there's a direction change, then we reduce step. this is like a binary search
                stepsize /= 2;
            }
            // another method we could try is newton's method. but that involves knowing the derivative

            tries++;
        }
    }
    gradDescent() {
        // TODO I guess eqbs could be better if you use gradient descent and calculate derivatives
        // loss = (Q - K)**2 (mean squared error loss)
        // dloss/dx = 2 * (Q-K) * dQ/dx
        // Q = (products) / (reactants)
        // for all x, dQ/dx = (calculate reaction quotient, excluding x)
        // if x is product, dQ/dx = Q/x
        // if x is reactant, dQ/dx = Qx 

        // loss = (Q - K)**2
        // loss = (II(products)/II(reactants) - K) ** 2
        // using partial derivative
        // Q_step = II(product_i + step * coeff_i)/II(reactants - step * coeff_i)
        // loss = (Q_step - K) ** 2// where step can be negative
        // dloss/dstep = 2(Q_step - K) * dQ_step/dstep
        // dQ_step/dstep = A TOTAL MESS
    }
    forEach(callback: (chem: Substance, coeff: num) => void) {
        this.forEachReactant(callback);
        this.forEachProduct(callback);
    }
    forEachReactant(callback: (chem: Substance, coeff: num) => void) {
        let i = 0;
        for (; i < this.brx.length; i++) {
            callback(this.brx[i], this.eqb.coefficients[i]);
        }
    }
    forEachProduct(callback: (chem: Substance, coeff: num) => void) {
        let j = 0;
        for (; j < this.bpx.length; j++) {
            callback(this.bpx[j], this.eqb.coefficients[j + this.brx.length]);
        }
    }
}
class InteractionGroup {
    substs: Substance[] = [];
    beqbs: BoundEqb[] = [];
    constructor(substs: Substance[], eqbs: Equilibrium[]) {
        this.substs = substs;
        for(let eqb of eqbs) {
            let beqb = new BoundEqb(eqb);
            beqb.bind(substs);
            this.beqbs.push(beqb);
        }
    }
    equilibriateAll() {
        
    }
    step() {
        for(let eqb of this.beqbs) {
            // TODO
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
