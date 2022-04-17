"use strict";
let idealGasLaw = nerdamer('P*V=n*R*T');
(() => {
    let evaluated = idealGasLaw.evaluate({ P: 1, V: 2, n: 3, R: 9.8 });
    evaluated.solveFor('T').toString();
})();
class DynamicLaw {
    /**
     * Update fields, then automatically update the unknown variable in accordance with the law.
     * @param s an arbitrary Substance
     * @param r a record of fields to change
     * @param unknown The variable to update and recalculate
     */
    update(s, r, unknown) {
        for (let key of Object.keys(r)) {
            this.setter(s, key, r[key]);
        }
        this.solveFor(s, unknown);
    }
    /**
     *
     * @param s Substance for which to fill out the fields in accordance to the law
     * @param variable This is the unknown field that we want to recalculate.
     * For instance, with PV=nRT, we can set s.P = 3;
     * Then call solveFor(s, 'V') to hold everything constant and have V be recalculated.
     */
    solveFor(s, variable) {
        let record = this.getters(s); // this is a dictionary of all the information we know
        let unknowns = []; // unknowns are all fields that are either undefined or are set undefined
        if (variable) { // if variable is provided, then we know which field to update
            // make sure the variable is actually a valid field and isn't some goofball variable from left field
            if (!(variable in record))
                throw new Error(`Variable ${variable} not found in equation ${this.law.text()}.`);
            unknowns.push(variable);
            delete record[variable];
        }
        for (let key of Object.keys(record)) { // removed undefined entries, which are unset fields = unknowns
            if (record[key] === undefined) {
                unknowns.push(key);
                delete record[key];
            }
        }
        // for each unknown we push, it should be 1 key deleted from the record.
        // therefore,
        if (record.length + unknowns.length !== this.varCount)
            throw Error(`somehow the number of unknowns is off: ${record.length} known + ${unknowns.length} unknowns != ${this.varCount}`);
        let variablesKnown = Object.keys(record).length;
        if (variablesKnown === this.varCount - 1) {
            // great. we're on track. 
            assert(unknowns.length === 1, `we literally already checked this, HOW is it already off? ${record.length} known + ${unknowns.length} unknowns != ${this.varCount}`);
            if (variable) {
                assert(variable === unknowns[0], `${variable} !== ${unknowns[0]} !??`);
            }
            else { // if we don't know the variable, we can infer it by the 
                variable = unknowns[0];
            }
        }
        else if (variablesKnown > this.varCount - 1) {
            // we already know all our information?
            // this shouldn't be possible, since we deleted 
            throw new Error(`Too much information? Processing equation ${this.law.text()} for variable ${variable}`);
        }
        else if (variablesKnown < this.varCount - 1) {
            // not enough information
            throw new Error(`Default information filling not implemented yet`);
        }
        else
            throw new Error(`Plain impossible`);
        let subbed = this.law.evaluate(record);
        let solved = subbed.solveFor(variable).valueOf(); // TODO check
        if (typeof (solved) === 'number') {
            this.setter(s, variable, solved);
        }
        else {
            throw new Error(`Equation ${this.law.text()} could not be fully reduced. Simplified equation: ${solved}. Error catching also failed to catch this`);
        }
    }
}
class IdealGasLaw extends DynamicLaw {
    constructor() {
        super(...arguments);
        this.law = nerdamer('P*V=n*R*T');
        this.varCount = 4;
    }
    constants() {
        return {
            R: 0.082057366080960 // L⋅atm⋅K−1⋅mol−1
        };
    }
    getters(s) {
        return {
            P: s.pressure,
            V: s.volume,
            n: s.mol,
            T: s.temperature
        };
    }
    setter(s, key, value) {
        switch (key) {
            case 'P':
                s.pressure = value;
                break;
            case 'V':
                s.volume = value;
                break;
            case 'n':
                s.mol = value;
                break;
            case 'T':
                s.temperature = value;
                break;
            default:
                throw new Error(`Variable ${key} not found in equation ${this.law.text()}.`);
        }
    }
}
