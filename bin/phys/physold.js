"use strict";
/// <reference path='../math.ts'/>
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
var PhysicsHook3 = /** @class */ (function () {
    function PhysicsHook3(pos, size) {
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
    Object.defineProperty(PhysicsHook3.prototype, "pos", {
        get: function () {
            return this.loc.pos(0);
        },
        set: function (position) {
            for (var i = 0; i < position.length; i++) {
                var x = position[i];
                if (x === undefined)
                    x = this.loc._x0[i];
            }
            this.loc._x0 = position;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhysicsHook3.prototype, "vel", {
        get: function () {
            return this.loc.vel(0);
        },
        set: function (velocity) {
            for (var i = 0; i < velocity.length; i++) {
                var x = velocity[i];
                if (x === undefined)
                    x = this.loc._v0[i];
            }
            this.loc._v0 = velocity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhysicsHook3.prototype, "acc", {
        get: function () {
            return this.loc.acc(0);
        },
        set: function (accel) {
            for (var i = 0; i < accel.length; i++) {
                var x = accel[i];
                if (x === undefined)
                    x = this.loc._a0[i];
            }
            this.loc._a0 = accel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhysicsHook3.prototype, "size", {
        get: function () {
            return [this.xsize, this.ysize, this.zsize];
        },
        set: function (x) {
            this.xsize = x[0], this.ysize = x[1], this.zsize = x[2];
        },
        enumerable: false,
        configurable: true
    });
    return PhysicsHook3;
}());
