// import { Vector } from "matter-js";

let __ = undefined;

let gvar = {} as any;

let universe = {} as any;

type num = number;
type tup = Array<number>;
type tup3 = [num, num, num];
// type vec = Vector;
let _hex = function () {
    function _componentToHex(c: number) {
        var hex = Math.round(Math.min(c, 255)).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    let hex = function (r: num, g: num, b: num, ...extras: num[]) {
        return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
    }
    return hex;
}();