
// TODO i've just created a glorified alias system. 

let idealGasLaw = nerdamer('P*V=n*R*T');
(() => {
    let evaluated = idealGasLaw.evaluate({ P: 1, V: 2, n: 3, R: 9.8 });

    evaluated.solveFor('T').toString();
})();

interface Law extends nerdamer.Expression {}

abstract class DynamicLaw<S extends Substance> {
    /** 
     * Return the number of non-constant variables. 
     * This should be equal to getters(arbitrarySubstance).getKeys().length()
     */
    abstract varCount: number; 
    // get df() {
    //     return this.varCount - 1;
    // }
    abstract constants(): Record<string, number>;
    abstract getters(s: S): Record<string, number>; // dynamic is possible, but expensive. see https://stackoverflow.com/questions/28402257/is-it-possible-to-get-a-reference-to-the-setter-function-of-a-setter
    abstract setter(s: S, key: string, value: num): void;
    abstract law: Law;
    abstract defaultPreservedVars: string[];
    /**
     * 
     * @param s Substance for which to fill out the fields in accordance to the law
     * @param variable This is the unknown field that we want to recalculate. 
     * For instance, with PV=nRT, we can set s.P = 3;
     * Then call solveFor(s, 'V') to hold everything constant and have V be recalculated.
     */
    solveFor(s: S, variable: string | undefined) {
        let record = this.getters(s); // this is a dictionary of all the information we know

        let unknowns = []; // unknowns are all fields that are either undefined or are set undefined
        
        if (variable) {// if variable is provided, then we know which field to update
            // make sure the variable is actually a valid field and isn't some goofball variable from left field
            if(!(variable in record))  
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
        let len = Object.keys(record).length;
        if(len + unknowns.length !== this.varCount)
            throw Error(`somehow the number of unknowns is off: ${len} known + ${unknowns.length} unknowns != ${this.varCount}`);

        let variablesKnown = Object.keys(record).length;
        if (variablesKnown === this.varCount - 1) {
            // great. we're on track. we only have 1 unknown

            assert(unknowns.length === 1, `we literally already checked this, how is it already off? ${record.length} known + ${unknowns.length} unknowns != ${this.varCount}`)
            if(variable) {
                assert(variable === unknowns[0], `${variable} !== ${unknowns[0]} !??`)
            } else { // if we don't know the variable, we can infer it by the 
                variable = unknowns[0];
            }
        } else if (variablesKnown > this.varCount - 1) {
            // we already know all our information?
            // this shouldn't be possible, since we deleted 
            throw new Error(`Too much information? Processing equation ${this.law.text()} for variable ${variable}`);
        } else if (variablesKnown < this.varCount - 1) {
            // not enough information
            throw new Error(`Default information filling not implemented yet`);
            
        } else throw new Error(`Plain impossible`);

        let subbed = this.law.evaluate(record); 
        // TODO another way is to solveFor, and then evaluate
        // and then we can keep a copy of each equation solved for each variable in cache
        
        let solved = subbed.solveFor(variable).valueOf(); // TODO check
        if(typeof(solved) === 'number') {
            this.setter(s, variable, solved);
        } else {
            throw new Error(`Equation ${this.law.text()} could not be fully reduced. Simplified equation: ${solved}. Error catching also failed to catch this`);
        }

    }
    //TODO automatically calculate the unknown from everything except the preserved
    /**
     * Update fields, then automatically update the unknown variable in accordance with the law.
     * @param subst an arbitrary Substance
     * @param r a record of fields to change
     * @param preservedVars
     * Remove variables from the record which can be assumed to be constant.
     * For an example, density or molarMass is a variable which is typically constant-ish.
     * While it's technically a variable and not a universal constnat (like R or c or planck's constant)
     * We usually don't want to change density
     * AKA intensive variables.
     * An interface can have the user dynamically choose which ones 
     * 
     * @description the unknown variable is automatically inferred from the remaining variables.
     */
    update(subst: S, r: Record<string, number>, preservedVars?: string[]) {
        for (let key of Object.keys(r)) {
            this.setter(subst, key, r[key]);
        }

        if(preservedVars === undefined) preservedVars = [];

        let changes = Object.keys(r);

        // we now remove preserved and changed variables to find the unknown

        let allvars = Object.keys(this.getters(subst)); // all the variables we know about
        allvars = allvars.filter(x => !changes.includes(x)); // remove changed variables as they cannot be the unknown

        // we remove preserved variables now
        allvars = allvars.filter(x => !preservedVars!.includes(x));

        let count = allvars.length;
        if(count === 0) {
            throw new Error(`No unknowns found in ${this.law.text()}`); // this is one way to handle this. This works as we make sure that
            // we never return a preserved variable.
            // alternatively, we can return the last preserved variable, as we know that the preserved variable must be in allvars
            // return preservedVars![preservedVars!.length - 1];
        }
        
        if (count === 1) {
            // of all the new variables, and of all of the preserved variables, we have only one unknown
            let unk = allvars[0];
            return this.solveFor(subst, unk);
        } else {
            // we can't solve for them all at once, because we don't know which one is which.
            throw new Error(`Multiple unknowns found in ${this.law.text()}`);
        }

        
    }
}
abstract class CompactLaw<S extends Substance> extends DynamicLaw<S> {
    varCount: num = 0;
    abstract law: Law;
    nerdnameToFieldname: Record<string, string>;

    getters(s: S): Record<string, number> {
        let build = {} as Record<string, number>;
        for(let nerdname of Object.keys(this.nerdnameToFieldname)) {
            let fieldname = this.nerdnameToFieldname[nerdname];
            // @ts-ignore
            build[nerdname] = s[fieldname];
        }
        return build;
    }
    setter(s: S, key: string, value: number): void {
        let fieldname = this.nerdnameToFieldname[key];
        if(fieldname !== undefined) {
            // @ts-ignore
            s[fieldname] = value;
        } else {
            throw new Error(`Variable ${key} not found in equation ${this.law.text()}.`);
        }
    }
    constructor(nerdnameToFieldname: Record<string, string>) {
        super();
        this.nerdnameToFieldname = nerdnameToFieldname;
        this.varCount = Object.keys(nerdnameToFieldname).length;
    }
}
class MolecularLaw<S extends IMolecularSubstance> extends CompactLaw<S>{

    law: Law = nerdamer('mass=molarMass*mol');
    constructor() {
        super({
            mass: 'mass',
            molarMass: 'molarMass',
            mol: 'mol'
        });
    }
    constants(): Record<string, number> {
        return {};
    }
    defaultPreservedVars = ['molarMass'];
    /**
     * @overrides
     * @param s 
     * @param key 
     * @param value 
     */
    setter(s: S, key: string, value: number): void {
        if (key === 'molarMass') console.log(`replacing molar mass of substance ${s.toString()}}? strange`);
        super.setter(s, key, value);
    }
}
class DensityLaw<S extends Substance & {density: number}> extends CompactLaw<S>{

    law: Law = nerdamer('m=rho*V');
    varCount = 3;
    constructor() {
        super({
            m: 'mass',
            rho: 'density',
            V: 'volume'
        });
    }
    constants(): Record<string, number> {
        return {};
    }
    defaultPreservedVars = ['rho'];
    setter(s: S, key: string, value: number): void {
        if (key === 'rho') console.log(`replacing density of substance ${s.toString()}}? strange`);
        super.setter(s, key, value);
    }
}
class IdealGasLaw<S extends MolecularSubstance & {pressure:number}> extends DynamicLaw<S>{
    defaultPreservedVars = ['T'];
    law: Law = nerdamer('P*V=n*R*T');

    constants() {
        return {
            R: 0.082057366080960 // L⋅atm⋅K−1⋅mol−1
        }
    }
    getters(s: S) {
        return {
            P: s.pressure,
            V: s.volume,
            n: s.mol,
            T: s.temperature
        }
    }
    varCount = 4;
    setter(s: S, key: string, value: number): void {
        switch(key) {
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

let equations = {
    density: new DensityLaw(),
    molar: new MolecularLaw(),
    ideal: new IdealGasLaw()
}
