/// <reference path='first.ts'/>
/// <reference path='chemicals.ts'/>
/// <reference path='data/ptable.ts'/>


// H2O (l) 2mol 
// H2O(l) 2mol
// H2O (l) 5mL
// CH3CH2OH(l) 16g
class AtomTracker {
    // start old atomtracker
    atoms: (string | AtomTracker)[]=[]; // can be a polyatomic
    qtys:num[] = [];

    atomicNums: num[]=[];
    _molarMass = 0;

    push(atom:string, qty=1) {

        if(typeof atom === 'string') {
            if (atom.startsWith('(')) {
                // it's a polyatomic ion
                assert(atom.slice(-1) === ')', 'Unbalanced parens');
                this.atoms.push(new AtomTracker(atom.slice(1, -1)));
                this.atomicNums.push(-1);

            } else {
                let idx = ptable_symbs.indexOf(atom);
                this.atoms.push(atom);
                this.atomicNums.push(idx); // Permit 0 and -1
            }
        } else {
            this.atoms.push(atom);
            this.atomicNums.push(-1);
        }
        this.qtys.push(qty);
        this._molarMass = 0;

    }
    setLastQuantity(qty:num) {
        this.qtys[this.qtys.length-1] = qty;
    }
    molarMass() {
        if(this._molarMass) return this._molarMass;
        let tot = 0;
        for(let i=0;i<this.atomicNums.length;i++) {
            let anum = this.atomicNums[i];
            let m;
            if(anum === -1 || anum === 0) {
                // we have a nonvalid atomic number. So it could be a polyatomic ion
                let polyatom = this.atoms[i];
                assert(polyatom instanceof AtomTracker, `atom ${polyatom} has an unknown atomic number and unknown mass, and is not a polyatom`)
                m = (polyatom as AtomTracker).molarMass();
            } else {
                m = ptable[anum].atomic_mass as num;
            }
            assert(m, `atomic mass for ${anum} is undefined?`);
            tot += this.qtys[i] * m;
        }
        this._molarMass = tot;
        return tot;
    }
    // end old atomtracker
    // start old formulaTknrBuilder
    // elems: string[] = [];
    formula: string = '';
    state: string = '';
    // qty: string = '';
    constructor(input?: SubstanceMaker | string | undefined) {
        if(!input) return;
        if(typeof input === 'string') {
            Tokenizers.formulaTokenizer(input, 0, this);
        } else if(input instanceof SubstanceMaker) {
            this.formula = input.chemicalFormula;
            this.state = input.state;
            if('newAtomTracker' in input) {
                // if the AtomTracker was cached, then we can save some compute and copy over the cached values
                let tracker = (input as SubstanceMaker & {'newAtomTracker': AtomTracker}).newAtomTracker;
                this.atoms = tracker.atoms;
                this.qtys = tracker.qtys;
                this.atomicNums = tracker.atomicNums;
                this._molarMass = tracker._molarMass;
            } else {
                // otherwise, we recompute
                Tokenizers.formulaTokenizer(this.formula, 0, this);
            }
            
        }
    }
}

namespace Tokenizers {
    function _isLower(inp: string) {
        return inp.length === 1 && 'abcdefghijklmnopqrstuvwxyz'.includes(inp);
    }
    function _isCapital(inp: string) {
        return inp.length === 1 && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(inp);
    }
    export function _isNumeric(inp: string) {
        return inp.length === 1 && '1234567890'.includes(inp);
    }
    export type tokenizer = (inp: string, startidx: num)=> [string, num]; // takes an original string, plus an index then returns a token plus a new index
    /**
     * General purpose chemical formula parser.
     * For example, it can parse "NaOH", "CaCl2", "KMNO4"
     * Polyatomic atoms like "Mg(OH)2" are not yet supported.
     * @param inp 
     * @param startidx 
     * @param atomt 
     * @returns 
     */
    export function formulaTokenizer(inp: string, startidx = 0, atomt?: AtomTracker): [string, num] {
        // TODO: Ambiguous statement: CaRbON
        // CAlcium RuBidium Oxygen Nitrogen = CARBON
        // let elems = [];
        if(atomt === undefined) {
            throw new Error('formulaTknr: AtomTracker is undefined');
        }
        atomt = atomt as AtomTracker;
        // bdr.atomt = new OldAtomTracker();
        // let elemt = bdr.atomt;

        let ptree = ptable_symb_tree as any;
        let i=startidx;

        function updateBdr(sliceidx: num, newidx: num = sliceidx): [string, num] {
            atomt!.formula = inp.slice(startidx, sliceidx);
            return [atomt!.formula, sliceidx];
        }
        let pre_whitespace_idx = -1;

        for (; i < inp.length; i++) {
            let c = inp[i];
            if(_isCapital(c)) {
                // start searching the tree
                if (!(c in ptable_symb_tree)) throw `Couldn't find capital letter ${c} as a chemical element name at index ${i} of ${inp} `;
                let capital = c;
                let possibs = ptree[c];
            
                // look ahead one
                if(i+1 >= inp.length) {
                    // uh oh an elem wont fit and we reached the end
                    // if at the end, then it signals a single capital at the end - for example H2O.
                    if (possibs.includes('')) {
                        atomt.push(capital);
                    } else { // error
                        throw "bad query";
                    }
                    // we're at the end so 

                    return updateBdr(i+1);
                }
                let next = inp[i+1];
                if(_isLower(next)) {
                    if (possibs.includes(next)) {
                        atomt.push('' + capital + next);
                        i++;
                        continue;
                    } else if (capital == 'U' && next == 'u') { // // special case for Uue
                        if(i+2 >= inp.length)                  // uh oh an elem wont fit and we reached the end
                            throw "bad query"; // and 'Uu' is not a possible elem
                        if (inp[i + 2] == 'e') {
                            atomt.push('Uue');
                            i+=2; // the incrementer adds one at the end
                            continue;
                        } else { // then 'Uux' is not a possible elem
                            throw "bad query";
                        }
                    } else {
                        throw "bad query";
                        // what to do
                        // the lower case letter is not in 
                    }
                } else {
                    // if not a lower case, then it might be a number or it just might be the empty char ie. oxygen - O
                    if (possibs.includes('')) {
                        atomt.push(capital);
                    } else {
                        // error
                        throw "bad query";
                    }
                }
            } else if(_isLower(c)) {
                // this should never happen! Only if it's a weird lower letter
                // actually this happens when we don't have a capital or when it is not a valid Symbol
                // ie if you query "ethanol (l)"
                // or "sodium acetate (aq)"
            } else if(_isNumeric(c)) {
                let [number, newidx] = numberTokenizer(inp, i, 0);
                atomt.setLastQuantity(parseInt(number)); // TODO sanitation
                i = newidx-1;
            } else if (c === '(') {
                // throw "unimplemented";
                let [parens, newidx] = parenthesizer(inp, i);
                if (parens == '') continue; // if nothing to parenthesize then let's just move on and ignore it
                if (!(parens[0] === '(' && parens[parens.length - 1] === ')')) throw `parenthesizer returned a fragment that doesn't both start and end with parentheses: ${parens}`;
                let insides = parens.slice(1, parens.length - 1);
                let stop = (pre_whitespace_idx !== -1) ? pre_whitespace_idx : i;
                if (insides === 's') {
                    // It could be a lone sulfur as a polyatomic ion
                    // although wtf
                    // Al2(S)3 7mL 
                    // bdr.formula = inp.slice(startidx, i);
                    // we reached a state of matter. we can stop now
                    atomt.state = 's';
                    return updateBdr(stop); // omit the parenthesized portion
                } else if(insides === 'l' || insides === 'L') {
                    atomt.state = 'l';
                    return updateBdr(stop);//[inp.slice(startidx, newidx), newidx];
                } else if(insides === 'g' || insides === 'G') {
                    atomt.state = 'g';
                    return updateBdr(stop);
                } else if(insides.toLowerCase() === 'aq') {
                    atomt.state = 'aq';
                    return updateBdr(stop);
                } else {
                    // then it's probably a polyatomic ion
                    // like Mg(OH)2g
                    // TODO
                    atomt.push(parens);
                    i=newidx-1;
                    continue;
                }            
            } else if(c === ' '){
                // ooh this is tough. Should we ignore whitespace or treat it as a delimiter?
                // well certain situations it's important to treat it as a delim
                // ie. H2O 5ml
                // but in other circumstances we should look ahead before returning
                // ie. H2O (g) 5mol
                // let next = inp[i+1];
                // if(next)
                let [__, newidx] = whitespaceTokenizer(inp, i);
                if (newidx >= inp.length) return updateBdr(i); // [inp.slice(startidx, i), i]; // if we reach the end then return and ignore the whitesp
                let c2 = inp[newidx];
                if(c2 == '(') {
                    // go run the parenthesizer
                    pre_whitespace_idx = i;
                    i=newidx-1;
                    // this will get incremented at the end of the loop so
                    // i = (newidx-1)++ = newidx
                    // at the next inp[i] = inp[newidx] = '(' --  there's NO infinite loop
                    // TODO this means that you can do something like 
                    // Mg        (OH)2
                    // or Al2         (SO4)3
                    // eh intended behavior
                } else if(_isNumeric(c2)) {
                    // in these circumstances it's probably safe to assume that that number is a quantity
                    // ie. CH3OH 2mL
                    // although that means that we can't accept spaces between the element and its (subscript) quantity
                    // ie. `H2O 2` wouldn't be parsed as H2O2
                    // although that means `Al 2 (SO4) 3` would be illegal
                    return updateBdr(i, newidx); // don't count the whitespace - remove trailing whitespacelk
                }

            } else {

            }
        }
        return updateBdr(i);//[inp.slice(startidx, i), i];
    }
    /**
     * You must include the starting parenthesis in the idx
     * // ie. if you tokenize Mg(OH)2 you must start on
     * index 2 which is the opening paren '('.
     * @param inp 
     * @param startidx 
     */
    export function parenthesizer(inp: string, startidx: num = 0): [string, num] {
        if (inp[startidx] !== '(') throw `You must include the starting parenthesis in the idx! ${inp}[${startidx}] === ${inp[startidx]}`;
        let parenlvl = 1;
        for (let i = startidx+1; i < inp.length; i++) {
            let c = inp[i];
            if (c === '(') {
                parenlvl++;
            } // check for monoatomic ions
            else if(c === ')') {
                parenlvl--;
            }
            if(parenlvl === 0) {
                return [inp.slice(startidx, i+1), i+1];
            }
        }
        // the parenthesis was never closed
        return ["", startidx];
    }
    /**
     * You must include the starting string opener (either '' or "") in the idx
     * // ie. if you tokenize Mg(OH)2 you must start on
     * index 2 which is the opening paren '('.
     * @param inp 
     * @param startidx 
     * @param escape_char
     * leave as empty string or undefined to not have an escape char
     */
    export function stringTokenizer(inp: string, startidx: num = 0, escape_char: string="\\"): [string, num] {
        let sc = undefined;
        if (inp[startidx] === '"') {
            sc = '"';
        } else if (inp[startidx] === "'") {
            sc = "'";
        } else throw `First char must be either ' or "! ${inp}[${startidx}] === ${inp[startidx]}`;
        // let parenlvl = 1;
        let isEscaped = false;
        for (let i = startidx + 1; i < inp.length; i++) {
            let c = inp[i];
            if(c === escape_char) {
                isEscaped = !isEscaped; // use the fact that two escapes cancel each other out.
            } else {
                if(c === sc && !isEscaped) {
                    
                    return [inp.slice(startidx, i + 1), i + 1];

                }
                isEscaped = false;
            }

        }
        // the string was never closed
        return ["", startidx];
    }

    export function numberTokenizer(inp: string, startidx: num=0, max_dots=1): [string, num] {
        let nums = '0123456789';
        let num_dots = 0;
        for (let i = startidx; i < inp.length; i++) {
            let c = inp[i];
            if (nums.includes(c)) {
                continue;
            } else if(c === '.') {
                num_dots++;
                if(num_dots > max_dots) return [inp.slice(startidx, i), i];
            // } else if(c === 'e') {
                // TODO: support scientific notation
                // ie. 7.384e9
                // or  4.106*10^-4
                // return [inp.slice(startidx, i), i];
            } else {
                return [inp.slice(startidx, i), i];
                // on anything else, break
            }
        }
        // if we get here, then we must have successfully ran until the end
        return [inp.slice(startidx), inp.length];
    }
    export function sciNumberTokenizer(inp: string, startidx: num = 0, max_dots = 1): [string, num] {
        let [numstr, newidx] = numberTokenizer(inp, startidx, max_dots);
        if (newidx < inp.length) {
            if (numstr == '') return ['', startidx]; 
            // only if there's a numeral do we continue looking for e
            // ie. just a simple "e10" will not do, it has to be "4.683e10"

            if (inp[newidx] === 'e' || inp[newidx] === 'E') {
                let [mantissa, new2] = numberTokenizer(inp, newidx, 0);
                return [inp.slice(startidx, new2), new2];
            } else if(inp.slice(newidx).startsWith('*10^')) {
                // TODO allow spaces
                throw "unimplemented";
            }
            // this is a sci notated number

        }
        return [numstr, newidx]; // the numeral is at the end of the string and completely fills it. just return that numeral
        //  ['', startidx];
        
        

    }
    export function whitespaceTokenizer(inp: string, startidx: num = 0): [string, num] {
        let spaces = ' \n\t';
        for (let i = startidx; i < inp.length; i++) {
            let c = inp[i];
            if (spaces.includes(c)) {
                continue;
            } else {
                return [inp.slice(startidx, i), i];
                // on anything else, break
            }
        }
        // if we get here, then we must have successfully ran until the end
        return [inp.slice(startidx), inp.length];
    }

    export function matchTokenizer(inp: string, rfncstr = '', startidx:num=0): [string, num] {
        if(rfncstr === '') throw "rfncstr must not be empty!";
        let j=0;
        let i=startidx;
        for(;j<rfncstr.length;) {
            if(i > inp.length) {
                // then we ran out on our tape
                throw `not enough space in inp to accomodate rfncstr! inp:${inp} rfncstr:${rfncstr} idx:${startidx}`;
            }

            if(inp[i] === rfncstr[j]) {
                i++;
                j++;
                continue;
            } else {
                // discrepancy detected
                return ['', startidx];
            }
        }
        // we continued the entire time
        let sliced = inp.slice(startidx, i);
        if(sliced !== rfncstr) throw ReferenceError(`AssertionError: ${sliced} should equal ${rfncstr}! ${inp} ${startidx} ${i}`);
        return [sliced, i];
        // the inp ran out before rfncstr

    }
    /**
     * base units should be ordered from the more specific to more general.
     * For example, we want to detect 'mol' before 'm'. That way, '6mol' is recognized as 6 moles and not 6 meters.
     */
    export const default_base_units = ['L', 'mol', 'M', 'J', 'V', 'W-h', 'atm', 'K', 
    'C', 'F', 'N', 'Pa', 'A', 'Hz', 
        'lbs', 'gal', 
        'm', 'g', 's']; // 'rad', 'sr', 'cd'];
    
    /**
     * Parses and tokenizes SI Units
     * @returns
     * [prefix: string, base_unit: string, next_idx: num]
     */
    export function unitTokenizer(inp:string, startidx:num=0, 
        base_units=default_base_units): [string, string, num] {

        let si_prefixes = ['n', 'µ','m','c','d','k'];

        // the idea is that we match greedily. First we assume there's a prefix, then look for a base unit
        // If we don't find a match, then we backstep and try again without a prefix
        // For example, first 'mol' would assume that the 'm' is a milli- SI prefix
        // but once we fail to find a match, we backtrack and try again without the 'm', thus recognizing the base unit 'mol'
        let firstChar = inp[startidx];
        let prefix = '';

        // begin for-loop initialization
        let state = 0;
        if (si_prefixes.includes(firstChar)) {
            prefix = firstChar; // if we find a prefix, use it
        } else {
            state = 1; 
            // if we fail to detect a prefix, we skip the first execution of the function skip to the second time
        }
        // end for-loop initialization

        for (; state < 2; state++) { 
            // really what this for-loop does is it repeats the following code twice

            if(state >= 1) { 
                // if we ever reach the second time, it means that we failed to match the prefix
                // the second time, we always use a null prefix = ''
                prefix = '';
            }

            for (let base of base_units) {
                if (inp.startsWith(base, startidx + prefix.length)) {
                    // great! we found a matching prefix and base unit
                    // we just need to do a check
                    let nextidx = startidx + prefix.length + base.length;
                    if (nextidx < inp.length) { // as long as we don't throw an out of bounds error
                        if (_isCapital(inp[nextidx]) || _isLower(inp[nextidx])) continue; 
                    
                        // check that the following character is not a letter
                        // for example, `cLasp` shouldn't be recognized as `cL`
                        // for example, `mol` shouldn't be recognized as `m` because the letter 'o' follows 'm'
                    }
                    return [prefix, base, nextidx];
                }
            }
                
            
        }

        return ['', '', startidx]; // what we return if we didn't find anything
            
        // }
    }

    // let q = [] as [num, string, string][];
    export class QtyUnitList {
        qtys: num[] = [];
        si_prefixes: string[] = [];
        units: string[] = [];
        push(qty: num, unit1: string, unit2?: string) {
            this.qtys.push(qty);
            if(unit2) {
                // if we have unit2, then we know
                // that unit1 is a prefix, and unit2 is a base unit
                // 
                this.si_prefixes.push(unit1);
                this.units.push(unit2);
            } else {
                this.si_prefixes.push('');
                this.units.push(unit1);
            }
        }
        toString() {
            let str = '';
            for(let i=0;i<this.qtys.length;i++) {
                str += `[${this.qtys[i]} ${this.units[i]}], `
            }
            return str;
        }
        computed() {
            return new ComputedQty(this);
            // for(let i=0;i<this.qtys.length;i++) {
                // let qty = this.qtys[i];
                // let pref = this.si_prefixes[i];
                // let unit = this.units[i];
                // b.push(qty, pref, unit);
            // }
        }
        /**
         * Gets the corresponding value based on the unit.
         * If the unit has not been specified, undefined is returned
         * @param base_unit For example, if `HCl 5mL 6mol` has been tokenized, the base unit would be `L` or `mol`
         */
        get(base_unit: string) {
            let idx = this.units.indexOf(base_unit);
            if(idx === -1) return undefined;
            return this.qtys[idx] * QtyUnitList.prefixToMultiplier(this.si_prefixes[idx]);
        }
        /**
         * This version of get() returns the unit prefix instead of multiplying.
         */
        getPrefixial(base_unit: string): [num, string] | undefined {
            let idx = this.units.indexOf(base_unit);
            if (idx === -1) return undefined;
            return [this.qtys[idx], this.si_prefixes[idx]];
        }
        static prefixToMultiplier(si_pref: string) {
            let si_prefixes = Constants.SIprefs;
            let mults = Constants.SIprefscoeffs;
            let idx = si_prefixes.indexOf(si_pref);
            if (idx >= 0) {
                return mults[idx];
            } else {
                throw ReferenceError(`prefix ${si_pref} not recognized!`);;
            }
        }
    }
}
/**
 * Deprecated for this reason: the order of quantities should NOT matter unless it's a last resort.
 * For instance, we want `5M 5mol and 5mol 5M` to be consistent 100% of the time.
 *
class QtyBuilder {
    
    _tolPct:num;
    qul: QtyUnitList;
    constructor(qtys: QtyUnitList, tolerancePercent=0.0001) { // use percents, because of sigfigs
        // because otherwise small numbers like 5 mm would have ridiculously small tolerance
        this._tolPct = tolerancePercent; // use tolerance=-1 to disable
        this.qul = qtys;
    }
    mass?: num;
    volume?: num;
    mol?: num;

    private isOutsideTolerance(orig:num|undefined, tent:num) {
        // orig: undefined -> false
        //       0         -> tolerance is checked
        //       17        -> tolerance is checked
        // tent: undefined -> not permitted
        //       0         -> tolerance is checked
        //       17        -> tolerance is checked
        return (orig !== undefined) && Math.abs(tent - orig) <= this._tolPct * orig;
    }
    push(qty:num, prefix:string, unit:string, check=true) {
        let mult = QtyUnitList.prefixToMultiplier(prefix);
        let tent = qty * mult;// tentative
        switch(unit) { 
            // TODO: checking breaks when there are zeroes
            // so there might be some wacky stuff like infinite volume,
            // infinite molarity / mass
            case 'L':
                if (check && this.isOutsideTolerance(this.volume, tent)) throw `Volume outside tolerance ${this.volume} ${tent}`;
                this.volume = tent;
                break;
            case 'g':
                if (check && this.isOutsideTolerance(this.mass, tent)) throw `Mass outside tolerance ${this.mass} ${tent}`;
                this.mass = tent;
                break;
            case 'mol':
                if (check && this.isOutsideTolerance(this.mol, tent)) throw `Mol outside tolerance ${this.mol} ${tent}`;
                this.mol = tent
                break;
            case 'M':
                let molarity = tent; // M = mol / volume
                if(this.mol === undefined) {
                    if(this.volume === undefined) {
                        // we got nothing
                        // whatever let's just set default
                        this.volume = 1;
                        this.mol = this.volume * molarity;
                    } else { // volume is defined
                        this.mol = this.volume * molarity;
                    }
                } else { // mol is defined
                    if(this.volume === undefined) { // volume = mol / M
                        this.volume = this.mol / molarity;
                    } else { // both mol & volume is defined
                        this.isOutsideTolerance(this.mol / this.volume, molarity);
                    }
                }
                break;
            default:
                break;
                

        }
        
    }

    
}*/

/**
 * Contains all quantitative properties of a substance (plus the state),
 * such that given a valid protosubstance we will be able to construct a substance from this.
 */
class ComputedQty {
    qul: Tokenizers.QtyUnitList;
    mass?:num;
    mol?:num;
    vol?:num;
    state?:string;
    constructor(qul: Tokenizers.QtyUnitList) {
        this.qul = qul;
        this.mass = qul.get('g'); // mass, mol, and vol are the most vital stats.
        this.mol = qul.get('mol');
        this.vol = qul.get('L');
        
        let M = qul.get('M');
        // magic inferral happens here
        if (this.state === undefined && M !== undefined) this.state = 'aq'; // ifwe get a Molarity reading (ie. 5M), assume aqueous
        if(M) {
            if(this.vol !== undefined && this.mol === undefined) {
                this.mol = M * this.vol;
            } else if(this.vol === undefined && this.mol !== undefined) {
                this.vol = M / this.mol;
            } else if(this.mol === undefined && this.mass === undefined && this.vol === undefined) {
                this.vol = 1;
                this.mol = this.vol * M;
            }
        }
    }

    // formFrom(pc: SubstanceMaker): Substance { // see SubstanceMaker.amount() }

}
namespace Tokenizers {
    /**
     * 
     * @param inp 
     * @param startidx 
     * @param qul This QtyUnitList will be MODIFIED and used to store the units and prefixes.
     * @returns the QtyUnitList is returned for convenience. However, if this value is discarded, the QtyUnitList is still accessible 
     * as the function mutates the QtyUnitList that was passed in as an argument.
     */
    export function quantityTokenizer(inp: string, startidx: num = 0, qul?: QtyUnitList, base_units?: string[]): [string, num, QtyUnitList] {
        // notice that "mL L g aq kg mol mmol" all can't be formed by chemical symbols
        // However Mg can, but not mg 
        // return ['', 0]; // TODO
        if(qul === undefined) {
            console.warn("quantityTknr: qul is undefined!");
            
            qul = new QtyUnitList();
        }
        let [__, idx] = whitespaceTokenizer(inp, startidx);
        if(idx >= inp.length) {
            // if whitespace reaches all the way to the end
            return ['', startidx, qul];
        }
        if (_isNumeric(inp[idx])) {
            // ah good
            let [num, idx2] = numberTokenizer(inp, idx);
            if (num === '') {
                // if we don't find a number
                return ['', startidx, qul];
            }
            let [__, idx3] = whitespaceTokenizer(inp, idx2);
            let [si1, si2, idx4] = unitTokenizer(inp, idx3, base_units);
            if (si2 === '') {
                // if we don't find a SI unit
                return ['', startidx, qul];
            }
            qul.push(parseFloat(num), si1, si2);
            return [inp.slice(startidx, idx4), idx4, qul];
        } else {
            // if there's no number then
            // either it's the currently unimplemented method
            // V=3mL etc.
            // or it's not a quantity
            return ['', startidx, qul];
            // throw "quantity tokenizer didn't find a ";
        }
    }
    /**
     * 
     * @param inp 
     * @param startidx 
     * @param qul This QtyUnitList will be MODIFIED and used to store the units and prefixes.
     * @returns the QtyUnitList is returned for convenience. However, if this value is discarded, the QtyUnitList is still accessible 
     * as the function mutates the QtyUnitList that was passed in as an argument.
     */
    export function quantitiesTokenizer(inp: string, startidx = 0, qbdr?: QtyUnitList, base_units?: string[]): [string, num, QtyUnitList] {
        if(qbdr === undefined) qbdr = new QtyUnitList();
        let [qtystr, idx, _] = quantityTokenizer(inp, startidx, qbdr, base_units);
        
        let __ = '';
        while(qtystr && idx < inp.length) {
            // [__, idx] = whitespaceTknr(inp, idx); qtytknr removes whitespace from the beginning
            
            [qtystr, idx, _] = quantityTokenizer(inp, idx, qbdr, base_units);
            
        }
        return [inp.slice(startidx, idx), idx, qbdr];
    }
}

