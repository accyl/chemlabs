// TODO: generalize this.
// ie. have a function algebra(eqn: string, vari... variables)
// in general if a provided variable is undefined, assume that it is
// to be solved.
// therefore if we have an eqn of 5 variables and 4 are given, there
// are there are 5 - 4 = 1 unknowns and we can solve.
// for n unknowns there are n-1 degrees of freedom.
// for example if we have PV=nRT
// ideally we would just call `algebra('PV=nRT', 1, undefined, 1, Constants.R, 273)
// and we plug in the variables in the order of appearance in the eqn from left to right
// ie. 1st is pressure P, then volume V, then mol n, then ideal gas constant R, then temp T.
// thus this would solve for volume of 1 mol 1 atm 273 K gas.
// meanwhile if we provide all 5 variables,
// then algebra() would simply plug it into the equation
// and check for equality within a certain tolerance.

class Operator {
    char;
    private constructor(char: string) {
        this.char = char;
        Operator.oplist.push(this);
    }
    static oplist: Operator[] = [];
    private static __ = function() {
        let ops = ['+', '-', '*', '/', '^'];
        for(let op of ops) new Operator(op);
    }();

}
class Expression {
    tokenlist: Array<string | Operator>=[];
    pushVar(varname: string) {
        this.tokenlist.push(varname);
    }
    pushOp(operator: string) {
        this.tokenlist.push(operator);
    }
}

function algebraTknr(inp: string, startidx:num) {
    for (let i = startidx; i < inp.length;i++) {

    }
}
function algebra(eqn: string, ...vari: num[]) {

}