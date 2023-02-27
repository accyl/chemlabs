// import { Vector } from "matter-js";

import { Beaker } from "./beaker";
import { ChemGlobal } from "./physvis";

// import { Beaker } from "./beaker";
// import { Global } from "./physvis";


// let gvar = {} as any;

// glob = Global
declare global {
    var universe: { engine: Matter.Engine, world: Matter.World, runner: Matter.Runner, paused: Boolean, screenstate: ScreenState, glob: ChemGlobal, beakers: Beaker[] };
}
// export let 
export function firstMain() {
    console.log('hi');
    let h;
    (h as any) = { beakers: [] as Beaker[] }; //  as { engine: Matter.Engine, world: Matter.World, runner: Matter.Runner, paused: Boolean, screenstate: ScreenState, glob: ChemGlobal, beakers: Beaker[] };
    (h as any).paused = false;
    (universe as any) = h;
}

// type vec = Vector;
function _componentToHex(c: number) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
export function toHex(r: num | num[], g?: num, b?: num, ...extras: num[]): string {
    if(Array.isArray(r)) {
        if(r.length !== 3) throw new Error("RGB array must be 3, but instead it is " + r.length);
        return toHex(r[0], r[1], r[2], ...extras);
    }
    if(g === undefined || b === undefined) throw new TypeError("Must provide r, g, and b");
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);

}
export function toRGB(hex: string): [num,num,num] {
    if(hex.startsWith('#')) hex = hex.substring(1);
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r,g,b];
}

// $('#einspector').on('substanceCreated', function (e, eventInfo) {
//     alert('(notifier1)The value of eventInfo is: ' + eventInfo);
// });
