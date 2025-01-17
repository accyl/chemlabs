"use strict";
// use preexisting data sources
/*
https://webbook.nist.gov/
https://kinetics.nist.gov/kinetics/welcome.jsp
https://academic.oup.com/nar/article/50/D1/D603/6445959
python equilibriator-api
Gibbs: https://chemistry.stackexchange.com/questions/27421/where-to-find-data-for-gibbs-energy-enthalpy-and-entropy

K Value:
https://pubs.acs.org/doi/10.1021/jacs.1c09820
https://open-reaction-database.org/client/search

 */
class RateExpression {
    constructor() {
        this.reactants = [];
        this.powers = [];
        this.k = 1; // rate 
    }
    R(orderedReactants) {
        assert(orderedReactants.length === this.reactants.length && this.reactants.length == this.powers.length);
        let tot = 1;
        for (let i = 0; i < this.reactants.length; i++) {
            assert(orderedReactants[i].isChemicalType(this.reactants[i]));
            tot *= Math.pow(orderedReactants[i].kValue, this.powers[i]);
        }
        return tot;
    }
}
class BoundRateExpr extends RateExpression {
    constructor(k, reactants) {
        super();
        this.brx = [];
        this.reactants = reactants;
        this.k = k;
    }
    bindReactants(...substances) {
        this.brx.push(...substances);
    }
    bindBeaker(beaker) {
        // TODO
        // greedy method: bind all of the reactants and products of the beaker
    }
    R() {
        return super.R(this.brx);
    }
}
class BalancedRxn {
    constructor(rxt, px, coeff) {
        this.reactants = [];
        this.products = [];
        this.coefficients = []; // reactants, then products
        this.reactants = rxt;
        this.products = px;
        this.coefficients = coeff;
    }
    chemicalEntry(index) {
        let chem = index >= this.reactants.length ? this.products[index - this.reactants.length] : this.reactants[index];
        let coeff = this.coefficients[index];
        return [chem, coeff];
    }
    forEach(callback) {
        this.forEachReactant(callback);
        this.forEachProduct(callback);
    }
    forEachReactant(callback) {
        let i = 0;
        for (; i < this.reactants.length; i++) {
            callback(this.reactants[i], this.coefficients[i]);
        }
    }
    forEachProduct(callback) {
        let j = 0;
        for (; j < this.products.length; j++) {
            callback(this.products[j], this.coefficients[j + this.reactants.length]);
        }
    }
}
class Equilibrium extends BalancedRxn {
    constructor(rxt, px, coeff, K) {
        super(rxt, px, coeff);
        // ΔG = nFE
        // ΔG = ΔH - TΔS
        // ΔG = ΔG° + RTlnQ
        // ΔG° = -RTlnK
        // K = exp(-RT/ΔG°)
        // Ecell = Ecell° - RT/(nF)*lnQ
        this.K = 1;
        this.K = K;
    }
    toJson() {
        return { 'K': this.K, 'rx': this.reactants, 'px': this.products, 'coeff': this.coefficients };
    }
    static fromJson(x) {
        return new Equilibrium(x.rx, x.px, x.coeff, x.K);
    }
    multiplyReactants(reactants) {
        let Rs = 1;
        for (let i = 0; i < reactants.length; i++) {
            let rxt = reactants[i];
            let coeff = this.coefficients[i];
            Rs *= Math.pow(rxt.kValue, coeff);
        }
        return Rs;
    }
    multiplyProducts(products) {
        let Ps = 1;
        let offset = this.reactants.length;
        for (let i = 0; i < products.length; i++) {
            let px = products[i];
            let coeff = this.coefficients[offset + i];
            Ps *= Math.pow(px.kValue, coeff);
        }
        return Ps;
    }
    Q(reactants, products) {
        return this.multiplyReactants(reactants) / this.multiplyProducts(products);
    }
    /**
     * @param all Input substances
     * @returns The input substances get split into reactants and products, respectively
     */
    partition(all) {
        let rxt = [];
        let px = [];
        for (let subst of all) {
            let inrx = this.reactants.includes(subst.type);
            let inpx = this.products.includes(subst.type);
            if (inrx === inpx)
                continue; // if a substance is in neither or it's in both, ignore
            if (inrx)
                rxt.push(subst);
            if (inpx)
                px.push(subst);
        }
        return [rxt, px];
    }
    plug(all) {
        this.Q(...this.partition(all));
    }
}
/**
 * An object that represents both an equilibrium and a binding between real substances
 *  such that Q can be calculated without worrying about the ordering of reactants and products
 */
class BoundEqb {
    constructor(eqb) {
        this.brx = [];
        this.bpx = [];
        this.effectiveRate = 0; // this rate is the forwardRate - backwardRate
        this.eqb = eqb;
    }
    get K() {
        return this.eqb.K;
    }
    // constructor(K: num, rxt: ChemicalType[], px: ChemicalType[]) {
    //     super(K, rxt, px);
    // }
    bindReactants(...sub) {
        this.brx.push(...sub);
    }
    bindProducts(...sub) {
        this.bpx.push(...sub);
    }
    bind(all) {
        let [rx, px] = this.eqb.partition(all);
        this.bindReactants(...rx);
        this.bindProducts(...px);
    }
    get Q() {
        // todo CACHE
        return this.eqb.Q(this.brx, this.bpx);
    }
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
    step(fractionMin = 0.5, exactr, forward) {
        if (forward === undefined) {
            if (this.Q === this.K)
                return 0; // don't step if we're already at eqb
            forward = this.Q < this.K;
        }
        // let deduct = forward ? this.brx : this.bpx; // if it's forward, then deduct from reactants. otherwise, deduct from products
        let minr = Number.POSITIVE_INFINITY;
        let eqb = this.eqb;
        let findLR = function (chem, coeff) {
            minr = Math.min(minr, chem.kValue / eqb.coefficients[coeff]);
        }; // finds the limit reagent
        if (forward) {
            this.forEachReactant(findLR);
        }
        else {
            this.forEachProduct(findLR);
        }
        let numr; // number of moles of reactions to proceed.
        if (exactr !== undefined) {
            numr = Math.min(exactr, minr);
        }
        else {
            numr = fractionMin * minr;
        }
        if (numr === Number.POSITIVE_INFINITY) {
            // then there IS NO LR so any numr should be fine
            numr = 0; // we set it to 0 just to be safe
        }
        if (forward) {
            this.forEachReactant((chem, coeff) => chem.kValue -= numr * coeff); // deduct reactants
            this.forEachProduct((chem, coeff) => chem.kValue += numr * coeff); // add to products
        }
        else { // backward
            this.forEachProduct((chem, coeff) => chem.kValue -= numr * coeff); // deduct products
            this.forEachReactant((chem, coeff) => chem.kValue += numr * coeff); // add to reactants
        }
        return numr;
    }
    autoeqb(maxerror = 0.1, maxtries = 100) {
        let prevdir = this.Q < this.K;
        let dir = prevdir;
        let stepsize = this.step(0.5, undefined, dir); // initial step is half of minstep
        let error = Math.abs(this.Q - this.K);
        let tries = 0;
        dir = this.Q < this.K;
        while (error > maxerror) {
            if (stepsize == 0 || tries > maxtries) {
                console.warn(`Preventatively aborting out of infinite loop? stepsize: ${stepsize} tries: ${tries} system: ${this}`);
                break; // try to prevent infinite loops
            }
            this.step(undefined, stepsize, dir);
            let Q = this.Q; // cache the computationally expensive Q
            prevdir = dir;
            dir = Q < this.K; // update direction
            error = Math.abs(Q - this.K);
            if (prevdir !== dir) {
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
    forEach(callback) {
        this.forEachReactant(callback);
        this.forEachProduct(callback);
    }
    forEachReactant(callback) {
        let i = 0;
        for (; i < this.brx.length; i++) {
            callback(this.brx[i], this.eqb.coefficients[i]);
        }
    }
    forEachProduct(callback) {
        let j = 0;
        for (; j < this.bpx.length; j++) {
            callback(this.bpx[j], this.eqb.coefficients[j + this.brx.length]);
        }
    }
}
class InteractionGroup {
    constructor(substs, eqbs) {
        this.substs = [];
        this.beqbs = [];
        this.substs = substs;
        for (let eqb of eqbs) {
            let beqb = new BoundEqb(eqb);
            beqb.bind(substs);
            this.beqbs.push(beqb);
        }
    }
    equilibriateAll() {
    }
    step() {
        for (let eqb of this.beqbs) {
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
// for N total substances
// B = elements in beaker
// TE = total number of eqb
// K = number of first-layer keys
// in all cases, TE / K = E = length of average Equilibrium[]
// 1-MAP = Map<SubstanceType, Equilibrium[]>
// K = N
// E = TE / N
// keys: N keys each with E entries, so N "buckets"
// memory: TE
// retrieval: O(B * E) = O(B * TE / N)
// retrieval per additional substance: O(B * E) = O(B * TE / N)
// 2-MAP = Map<[SubstanceType, SubstanceType], Equilibrium[]>:
// each key is a pair of two reactants, being sorted using any arbitrary but definitive comparison function
// keys: N**2/2 keys
// E = TE / N**2/2 = 2TE / N**2
// memory: TE
// retrieval: O(B**2 / 2 * E) = O(B**2 * TE / N**2) = O(TE * B**2 / N**2)
// B**2 / N**2 = (B / N)**2. Since B <= N, (B/N) <= 1, so B**2 / N**2 <= B/N so this will always be faster than 1-MAP
// but the memory setup is more complicated and there is probably a larger constant factor
// the reason why we can't extend this to 3+ keys is because many reactions only have 2 reactants => only 2 keys
// so then we would have to backcheck.
// (in fact some reactions have only 1 reactant, but those I will treat differently)
// at that point it would be basically just a gigantic hashmap
//
// retrieval per additional substance: O(B * E) = O(2B * TE / N**2)
// O(2B * TE / N**2) ?< O(B * TE / N) => O(2 / N) < O(1) => true if N > 2. So this will essentially always be faster than 1-MAP
// Arguments based on avreage E depends on if all buckets are close to same size.
// in fact average E is the best case (based on binary search argument)
// Aka low variability, all buckets close to the same size = best case, good
// n-BINARY SEARCHES for n=B
// this corresponds to a real database
// for a binary search, expected is the same as worst case
// Retrieval: O(
// log(TE) * log(TE/N) * log(TE/N**2) * ... * log(TE/N**B)
// ) = O(
// (TE + log(1)) * (TE + log(1/N) * (TE + log(1/N**2)))
// )
// Additional substance:
// O(log(TE / E) * E = (log(TE) - E) * E
// database search for any matching power set
// SELECT reaction_id, rxt1, K FROM eqbs WHERE 
// eqbs.rxt1 IN (beaker1, beaker2, ...) 
// AND eqbs.rxt2 IN (beaker1, beaker2, ...)
// AND (eqbs.rxt3 IN (beaker1, beaker2, ...) OR rxt3 IS NULL)
// AND (eqbs.rxt4 IN (beaker1, beaker2, ...) OR rxt4 IS NULL) 
// ...
class InteractionsDatabase {
    static compare(a, b) {
        if (a.type < b.type) {
            return -1;
        }
        else if (a.type > b.type) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
class DatabaseHashMap {
    constructor(eqbs) {
        this.eqbmap = new Map();
        for (let eqb of eqbs) {
            // find the rarest reactant
            let rarest = this.findRarest(eqb.reactants);
            // TODO I might have to hard code it
            // but we MUST find the rarest reactant so we don't store like 6000 entries for H2O
            // and every time we try to look up some reaction involving water we have to search through 6000 
            // random entries
            let entry = this.eqbmap.get(rarest);
            if (entry == undefined) {
                entry = [eqb];
                this.eqbmap.set(rarest, entry);
            }
            else {
                entry.push(eqb);
            }
        }
    }
    // TODO this might be improved by a massive tree.
    // for a tree with 2 layers, the data structure would be Map<SubstanceType, Map<SubstanceType, Equilibrium[]>>
    // for a tree with n layers, the data structure would be 
    // type TREE = Map<SubstanceType, TREE> | Equilibrium[];
    // TODO or perhaps afte rthe first layer we use a binary tree to improve on search time
    // Map<SubstanceType, BinaryTree<Equilibrium>>
    determineRarity(reactant) {
        // TODO I think we should calculate this, then cache the values, then use the cache
        // then periodically recalculate assuming that the relative rarity won't drastically change
        // and that they will instead approach some constant and remain stable.
        // for now let's just hardcode some constants
    }
    findRarest(reactants) {
        return reactants.reduce((a, b) => this.determineRarity(a) < this.determineRarity(b) ? a : b);
    }
    storeEquilibrium(eqb) {
        let rarest = this.findRarest(eqb.reactants);
        let entry = this.eqbmap.get(rarest);
        if (entry == undefined) {
            entry = [eqb];
            this.eqbmap.set(rarest, entry);
        }
        else {
            entry.push(eqb);
        }
    }
    equilibriaByReactants(reactants) {
        let filtered = [];
        for (let rxt of reactants) {
            let eqbs = this.eqbmap.get(rxt.type);
            eqbs = eqbs ? eqbs : [];
            for (let eqb of eqbs) {
                // if all of reactants are present
                if (reactants.reduce((acc, rxt) => acc && eqb.reactants.indexOf(rxt.type) >= 0, true)) {
                    filtered.push(eqb);
                }
            }
        }
        return filtered;
    }
}
class EquilibriumAssigner {
    constructor(beaker) {
        this.beaker = beaker;
    }
    findEquilibria() {
    }
    uponNewReactant(reactant) {
        // ugh
        // if we store multiple copies of each eqb, then we wouldn't have to reiterate through all possibilities
        // but since we don't store multiple copies of each eqb, we would have to store multiple copies of each reactant
        // unless we use a binary tree
        // then it would be much faster, because 
        // with all of the other reactants we would only
        // have to search for our new reactant
        // as well as all of the immediate possibiltiies
    }
}
