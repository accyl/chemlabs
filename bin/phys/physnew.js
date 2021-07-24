"use strict";
// /*
// abstract class GeneralizedFunction {
//     abstract _zeroes(): tup;
//     _x0: tup;
//     _v0: tup;
//     _a0: tup;
//     n3deriv?: tup[];
//     constructor(pos?: [num, num, num], vel?: [num, num, num], acc?: [num, num, num], n3deriv?: [num, num, num][]) {
//         this._x0 = pos ? pos : this._zeroes().map(x => x+1); 
//         this._v0 = vel ? vel : this._zeroes();
//         this._a0 = acc ? acc : this._zeroes();
//         if (n3deriv) {
//             this.n3deriv = n3deriv;
//         }
//     }
//     pos(t?: num): tup {
//         return this._x0;
//     }
//     vel(t?: num): tup {
//         return this._v0;
//     }
//     acc(t?: num): tup {
//         return this._a0;
//     };
//     nthderiv(n: number, t: number): tup {
//         switch (n) {
//             case 0:
//                 return this.pos(t);
//             case 1:
//                 return this.vel(t);
//             case 2:
//                 return this.acc(t);
//             default:
//                 if(this.n3deriv) return this.n3deriv[n-3];
//                 return this._zeroes();
//         }
//     }
//     step(t0: num, dt: num) {
//         /**
//          * applies euler's method once 
//          * dt = stepsize
//          */
//         let dx = this.vel(t0).map(v => v * dt);
//         this._x0 = this.pos(t0).map((x, i) => x + dx[i]); // perform a veloity update
//         let dv = this.acc(t0).map(a => a * dt);
//         this._v0 = this.vel(t0).map((v, i) => v + dv[i]); // perform a veloity update
//         // TODO updates of higher order derivatives
//     }
//     eulers(t0: num, dt: num, nsteps: num) {
//         for (let i = 0; i < nsteps; i++) {
//             this.step(t0, dt);
//             t0 = t0 + dt;
//         }
//     }
// }
// class Locatable extends GeneralizedFunction {
//     _zeroes() {
//         return [0, 0, 0];
//     }
//     static NONE = function() {
//         let retn=  new Locatable();
//         retn._x0 = [0, 0, 0];
//         retn.step = function(a, b) {};
//         retn.eulers = function(a, b, c) {};
//         return retn;
//     }();
// }
// interface Tangible {
//     loc(): Locatable;
// }
// // function tang(obj: Substance|System): Tangible {
// //     if(obj instanceof Substance) {
// //         let loc = new Locatable();
// //         return {}
// //     } else if(obj instanceof System) {
// //     }
// // }
// class PhysicsHook {
//     loc: Locatable;
//     xsize: num = 10;
//     ysize: num = 10;
//     zsize: num = 10;
//     static DEFAULT = new PhysicsHook();
//     constructor(pos?: [num, num, num], size?: [num, num, num]) {
//         this.loc = pos ? new Locatable(pos) : Locatable.NONE;
//         if (size) {
//             this.xsize = size[0];
//             this.ysize = size[1];
//             this.zsize = size[2];
//         }
//     }
//     set pos(position: [num, num, num]) {
//         for(let i=0;i<position.length;i++) {
//             let x = position[i];
//             if(x === undefined) x = this.loc._x0[i];
//         }
//         this.loc._x0 = position;
//     }
//     get pos() {
//         return this.loc.pos(0) as [num, num, num];
//     }
