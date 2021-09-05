/// <reference path='ptable.ts'/>
/// <reference path='chemicals.ts'/>


// H2O (l) 2mol 
// H2O(l) 2mol
// H2O (l) 5mL
// CH3CH2OH(l) 16g
class AtomTracker {
    _atoms: string[]=[]; // can be a polyatomic
    _qtys:num[] = [];

    _atomicNums: num[]=[];
    _molarMass = 0;

    push(atom:string, qty=1) {
        this._atoms.push(atom);
        if(atom.startsWith('(')) {
            // it's a polyatomic ion
            assert(atom.slice(-1) === ')', 'Unbalanced parens');
        } else {
            let idx = ptable_symbs.indexOf(atom);
            this._atomicNums.push(idx); // Permit 0 and -1
        }
        this._qtys.push(qty);
        this._molarMass = 0;
    }
    setLastQty(qty:num) {
        this._qtys[this._qtys.length-1] = qty;
    }
    molarMass() {
        if(this._molarMass) return this._molarMass;
        let tot = 0;
        for(let i=0;i<this._atomicNums.length;i++) {
            let anum = this._atomicNums[i];
            let m = ptable[anum].atomic_mass as num;
            assert(m, `atomic mass for ${anum} is undefined?`);
            tot += this._qtys[i] * m;
        }
        this._molarMass = tot;
        return tot;
    }
}
class ChemicalBuilder {
    atomt: AtomTracker = new AtomTracker();
    // elems: string[] = [];
    formula: string = '';
    state: string = '';
    qty: string = '';
}
function _isLower(inp: string) {
    return inp.length === 1 && 'abcdefghijklmnopqrstuvwxyz'.includes(inp);
}
function _isCapital(inp: string) {
    return inp.length === 1 && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(inp);
}
function _isNumeric(inp: string) {
    return inp.length === 1 && '1234567890'.includes(inp);
}
const gbdr = new ChemicalBuilder();
type tokenizer = (inp: string, startidx: num)=> [string, num]; // takes an original string, plus an index then returns a token plus a new index
function formulaTknr(inp: string, startidx = 0, bdr = gbdr): [string, num] {
    // TODO: Ambiguous statement: CaRbON
    // CAlcium RuBidium Oxygen Nitrogen = CARBON
    // let elems = [];
    bdr.atomt = new AtomTracker();
    let elemt = bdr.atomt;

    let ptree = ptable_symb_tree as any;
    let i=startidx;

    function updateBdr(sliceidx: num, newidx: num = sliceidx): [string, num] {
        bdr.formula = inp.slice(startidx, sliceidx);
        return [bdr.formula, sliceidx];
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
                    elemt.push(capital);
                } else { // error
                    throw "bad query";
                }
                // we're at the end so 

                return updateBdr(i+1);
            }
            let next = inp[i+1];
            if(_isLower(next)) {
                if (possibs.includes(next)) {
                    elemt.push('' + capital + next);
                    i++;
                    continue;
                } else if (capital == 'U' && next == 'u') { // // special case for Uue
                    if(i+2 >= inp.length)                  // uh oh an elem wont fit and we reached the end
                        throw "bad query"; // and 'Uu' is not a possible elem
                    if (inp[i + 2] == 'e') {
                        elemt.push('Uue');
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
                    elemt.push(capital);
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
            let [number, newidx] = numberTknr(inp, i, 0);
            elemt.setLastQty(parseInt(number)); // TODO sanitation
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
                bdr.state = 's';
                return updateBdr(stop); // omit the parenthesized portion
            } else if(insides === 'l' || insides === 'L') {
                bdr.state = 'l';
                return updateBdr(stop);//[inp.slice(startidx, newidx), newidx];
            } else if(insides === 'g' || insides === 'G') {
                bdr.state = 'g';
                return updateBdr(stop);
            } else if(insides.toLowerCase() === 'aq') {
                bdr.state = 'aq';
                return updateBdr(stop);
            } else {
                // then it's probably a polyatomic ion
                // like Mg(OH)2g
                bdr.atomt.push(parens);
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
            let [__, newidx] = whitespaceTknr(inp, i);
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
function parenthesizer(inp: string, startidx: num = 0): [string, num] {
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
function stringTknr(inp: string, startidx: num = 0, escape_char: string="\\"): [string, num] {
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

function numberTknr(inp: string, startidx: num=0, max_dots=1): [string, num] {
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
function sciNumberTknr(inp: string, startidx: num = 0, max_dots = 1): [string, num] {
    let [numstr, newidx] = numberTknr(inp, startidx, max_dots);
    if (newidx < inp.length) {
        if (numstr == '') return ['', startidx]; 
        // only if there's a numeral do we continue looking for e
        // ie. just a simple "e10" will not do, it has to be "4.683e10"

        if (inp[newidx] === 'e' || inp[newidx] === 'E') {
            let [mantissa, new2] = numberTknr(inp, newidx, 0);
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
function whitespaceTknr(inp: string, startidx: num = 0): [string, num] {
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

function matchTknr(inp: string, rfncstr = '', startidx:num=0): [string, num] {
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
 * Parses and tokenizes SI Units
 * @returns
 * [prefix: string, base_unit: string, next_idx: num]
 */
function unitTknr(inp:string, startidx:num=0, 
    base_units=['g','L','mol','M','m', 'J', 'V', 'W-h', 'atm']): [string, string, num] {
    let si_prefixes = ['n', 'µ','m','c','d','k'];
    // for(let i=startidx;i<inp.length;i++) {
    let c = inp[startidx];
    let i2 = 0;
    let s2 = '';
    let prefix = '';
    if(si_prefixes.includes(c)) {
        // we're not in the clear yet. We have to find a matching base unit
                // TODO edge case for mol it gets confused for base unit of m
        i2 = startidx+1;
        prefix = c;
    } else {
        // we don't have a prefix, it's just the regular base unit
        i2 = startidx;
    }
    let max = i2+3 > inp.length ? inp.length : i2+3;
    s2 = inp.slice(i2, max); // max length of base_units = 3

    for(let base of base_units) {
        if(s2.startsWith(base)) {
            // first check for a closing condition - no letters behind
            let nextidx = startidx+1+base.length;
            if(nextidx < inp.length) {
                // if there's more characters, we need to check that
                // there aren't any additional letters
                // for example, `cLasp` shouldn't be recognized as `cL`
                if(_isCapital(inp[nextidx]) || _isLower(inp[nextidx])) continue;
            }
            // return [inp.slice(startidx, nextidx), nextidx]
            return [prefix, base, nextidx];
        }
    }
    // no match
    // but wait first we have to check the edge case of mmol/ mol / mm / m
    // TODO optimize 
    // TODO rewrite this for the general case
    if(prefix && inp[startidx] == 'm') {
        // normally we would have a for loop for(let base of base_units) here,
        // but that seems a bit excessive for just one case
        for(let base of ['mol', 'm']) { // actually there's two cases. Which warrants a for loop
            if (inp.slice(startidx).startsWith(base)) {
                let nextidx = startidx + 1 + base.length;
                if (!(nextidx < inp.length && (_isCapital(inp[nextidx]) || _isLower(inp[nextidx])))) {//continue;
                    // if there's more characters, we need to check that
                    // there aren't any additional letters
                    // for example, `cLasp` shouldn't be recognized as `cL`
                    // return [inp.slice(startidx, nextidx), nextidx];
                    return ['', base, nextidx]; // TODO not hard code this in
                }
            }
        }
    }
    return ['', '', startidx];
        
    // }
}

// let q = [] as [num, string, string][];
class QtyUnitList {
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
    toBuilder() {
        let b = new QtyBuilder();
        for(let i=0;i<this.qtys.length;i++) {
            let qty = this.qtys[i];
            let pref = this.si_prefixes[i];
            let unit = this.units[i];
            b.push(qty, pref, unit);
        }
        return b;
    }
}
class QtyBuilder {
    _tolPct:num;
    constructor(tolerancePercent=0.0001) { // use percents, because of sigfigs
        // because otherwise small numbers like 5 mm would have ridiculously small tolerance
        this._tolPct = tolerancePercent; // use tolerance=-1 to disable
    }
    mass?: num;
    volume?: num;
    mol?: num;
    static prefixToMultiplier(si_pref: string) {
        let si_prefixes = ['n', 'µ', 'm', 'c', 'd', '', 'k'];
        let mults = [1e-9, 1e-6, 1e-3, 1e-2, 1e-1, 1, 1e3]
        let idx = si_prefixes.indexOf(si_pref);
        if (idx >= 0) {
            return mults[idx];
        } else {
            throw ReferenceError(`prefix ${si_pref} not recognized!`);;
        }
    }
    private isOutsideTolerance(orig:num|undefined, tent:num, throwme=true) {
        // orig: undefined -> false
        //       0         -> tolerance is checked
        //       17        -> tolerance is checked
        // tent: undefined -> not permitted
        //       0         -> tolerance is checked
        //       17        -> tolerance is checked
        let b = (orig !== undefined) && Math.abs(tent - orig) <= this._tolPct * orig;
        if(b && throwme) throw `outside tolerance ${orig} ${tent}`;
        return b;
    }
    push(qty:num, prefix:string, unit:string, check=true) {
        let mult = QtyBuilder.prefixToMultiplier(prefix);
        let tent = qty * mult;// tentative
        switch(unit) { // TODO: checking breaks when there are zeroes
            // so there might be some wacky stuff like infinite volume,
            // infinite molarity / mass
            case 'L':
                if(check) this.isOutsideTolerance(this.volume, tent);
                this.volume = tent;
                break;
            case 'g':
                if (check) this.isOutsideTolerance(this.mass, tent);
                this.mass = tent;
                break;
            case 'mol':
                if (check) this.isOutsideTolerance(this.mol, tent);
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

    
}
const gqul = new QtyUnitList();
function qtyTknr(inp: string, startidx: num = 0, qul: QtyUnitList = gqul): [string, num] {
    // notice that "mL L g aq kg mol mmol" all can't be formed by chemical symbols
    // However Mg can, but not mg 
    // return ['', 0]; // TODO
    let [__, idx] = whitespaceTknr(inp, startidx);
    if(idx >= inp.length) {
        // if whitespace reaches all the way to the end
        return ['', startidx];
    }
    if (_isNumeric(inp[idx])) {
        // ah good
        let [num, idx2] = numberTknr(inp, idx);
        if (num === '') {
            // if we don't find a number
            return ['', startidx];
        }
        let [__, idx3] = whitespaceTknr(inp, idx2);
        let [si1, si2, idx4] = unitTknr(inp, idx3);
        if (si2 === '') {
            // if we don't find a SI unit
            return ['', startidx];
        }
        qul.push(parseFloat(num), si1, si2);
        return [inp.slice(startidx, idx4), idx4];
    } else {
        // if there's no number then
        // either it's the currently unimplemented method
        // V=3mL etc.
        // or it's not a quantity
        return ['', startidx];
        // throw "quantity tokenizer didn't find a ";
    }
}
function qtysTknr(inp: string, startidx = 0, qbdr: QtyUnitList = gqul): [string, num] {
    let [qtystr, idx] = qtyTknr(inp, startidx, qbdr);
    let __ = '';
    while(qtystr && idx < inp.length) {
        // [__, idx] = whitespaceTknr(inp, idx); qtytknr removes whitespace from the beginning
        [qtystr, idx] = qtyTknr(inp, idx, qbdr);
    }
    return [inp.slice(startidx, idx), idx];
}

function grandUnifiedTknr(inp:string, startidx=0): [ChemicalBuilder, QtyUnitList] {
    if(startidx >= inp.length) throw ReferenceError("bruh"); // really?
    if(_isNumeric(inp[startidx])) {
        let qbdr = new QtyUnitList();
        let [qty, idx] = qtysTknr(inp, startidx, qbdr);
        let [__, idx2] = whitespaceTknr(inp, idx);
        let fbdr = new ChemicalBuilder();
        let [formula, idx3] = formulaTknr(inp, idx2, fbdr);
        return [fbdr, qbdr];
    } else {

        let fbdr = new ChemicalBuilder();
        let [formula, idx] = formulaTknr(inp, startidx, fbdr);
        let qbdr = new QtyUnitList();
        let [qty, idx2] = qtysTknr(inp, idx, qbdr);
        let [__, idx3] = whitespaceTknr(inp, idx2);
        return [fbdr, qbdr];
    }
}
function w(inp: string, display=true) {
    let subst;
    let [chem, qty] = grandUnifiedTknr(inp);
    // form.formula
    let formula = chem.formula;
    let protos = undefined;
    if(chemicals.has(formula)) {
        protos = chemicals.get(formula);
    } else {
        protos = chemicals.getNew(chem);
        console.log(`formula ${formula} not found in list of chemicals. autogenerating...`);
    }
    if (protos) {
        // let pargs = protos.args();
        // let qbuild = qty.toBuilder();
        subst = protos.amt(qty, chem.state);
        
    } else {
        throw protos;
    }
    // } else {

    if(display) {
        tang(subst);
        updateZIndex();
        redraw();
        return subst;
    } else {
        return subst;
    }
    // TODO: with a greedy algorithm, we can
    // actually attempt to process formulas that
    // are 'lazily' in all lower case. for
    // example kmno4. 
    // although by definition it won't always work - see no
    // or hga - HGa
}