"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GeneralizedFunction = /** @class */ (function () {
    function GeneralizedFunction(pos, vel, acc, n3deriv) {
        this._x0 = pos ? pos : this._zeroes().map(function (x) { return x + 1; });
        this._v0 = vel ? vel : this._zeroes();
        this._a0 = acc ? acc : this._zeroes();
        if (n3deriv) {
            this.n3deriv = n3deriv;
        }
    }
    GeneralizedFunction.prototype.pos = function (t) {
        return this._x0;
    };
    GeneralizedFunction.prototype.vel = function (t) {
        return this._v0;
    };
    GeneralizedFunction.prototype.acc = function (t) {
        return this._a0;
    };
    ;
    GeneralizedFunction.prototype.nthderiv = function (n, t) {
        switch (n) {
            case 0:
                return this.pos(t);
            case 1:
                return this.vel(t);
            case 2:
                return this.acc(t);
            default:
                if (this.n3deriv)
                    return this.n3deriv[n - 3];
                return this._zeroes();
        }
    };
    GeneralizedFunction.prototype.step = function (t0, dt) {
        /**
         * applies euler's method once
         * dt = stepsize
         */
        var dx = this.vel(t0).map(function (v) { return v * dt; });
        this._x0 = this.pos(t0).map(function (x, i) { return x + dx[i]; }); // perform a veloity update
        var dv = this.acc(t0).map(function (a) { return a * dt; });
        this._v0 = this.vel(t0).map(function (v, i) { return v + dv[i]; }); // perform a veloity update
        // TODO updates of higher order derivatives
    };
    GeneralizedFunction.prototype.eulers = function (t0, dt, nsteps) {
        for (var i = 0; i < nsteps; i++) {
            this.step(t0, dt);
            t0 = t0 + dt;
        }
    };
    return GeneralizedFunction;
}());
var Locatable = /** @class */ (function (_super) {
    __extends(Locatable, _super);
    function Locatable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Locatable.prototype._zeroes = function () {
        return [0, 0, 0];
    };
    Locatable.NONE = function () {
        var retn = new Locatable();
        retn._x0 = [0, 0, 0];
        retn.step = function (a, b) { };
        retn.eulers = function (a, b, c) { };
        return retn;
    }();
    return Locatable;
}(GeneralizedFunction));
// function tang(obj: Substance|System): Tangible {
//     if(obj instanceof Substance) {
//         let loc = new Locatable();
//         return {}
//     } else if(obj instanceof System) {
//     }
// }
var PhysicsHook = /** @class */ (function () {
    function PhysicsHook(pos, size) {
        this.xsize = 10;
        this.ysize = 10;
        this.zsize = 10;
        this.loc = pos ? new Locatable(pos) : Locatable.NONE;
        if (size) {
            this.xsize = size[0];
            this.ysize = size[1];
            this.zsize = size[2];
        }
    }
    PhysicsHook.DEFAULT = new PhysicsHook();
    return PhysicsHook;
}());
