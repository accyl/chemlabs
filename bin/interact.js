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
function kValue(subst) {
    // return subst.kValue();
    if ('kValue' in subst)
        return subst.kValue;
    if ('pressure' in subst)
        return subst.pressure;
    if ('concentration' in subst)
        return subst.concentration;
    return 1; // ignore
}
var BalancedRxn = /** @class */ (function () {
    function BalancedRxn() {
        this.reactants = [];
        this.products = [];
    }
    return BalancedRxn;
}());
var RateExpression = /** @class */ (function () {
    function RateExpression() {
        this.reactants = [];
        this.powers = [];
        this.k = 1;
    }
    RateExpression.prototype.R = function (orderedReactants) {
        assert(this.reactants.length == this.powers.length);
        var tot = 1;
        for (var i = 0; i < this.reactants.length; i++) {
            assert(orderedReactants[i].type.equals(this.reactants[i]));
            tot *= Math.pow(kValue(orderedReactants[i]), this.powers[i]);
        }
        return tot;
    };
    return RateExpression;
}());
var Equilibrium = /** @class */ (function (_super) {
    __extends(Equilibrium, _super);
    function Equilibrium() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.K = 1;
        return _this;
    }
    // ΔG = ΔG° + RTlnQ
    // ΔG° = -RTlnK
    // K = exp(-RT/ΔG°)
    // ?? ΔG = ΔH - TΔS
    // 
    Equilibrium.prototype.plugReactants = function (reactants) {
        var Rs = 1;
        for (var _i = 0, reactants_1 = reactants; _i < reactants_1.length; _i++) {
            var rxt = reactants_1[_i];
            Rs *= kValue(rxt);
        }
        return Rs;
    };
    Equilibrium.prototype.plugProducts = function (products) {
        var Ps = 1;
        for (var _i = 0, products_1 = products; _i < products_1.length; _i++) {
            var px = products_1[_i];
            Ps *= kValue(px);
        }
        return Ps;
    };
    Equilibrium.prototype.Q = function (reactants, products) {
        return this.plugReactants(reactants) / this.plugProducts(products);
    };
    Equilibrium.prototype.plug = function (all) {
        var rxt = [];
        var px = [];
        for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
            var subst = all_1[_i];
            if (this.reactants.includes(subst.type)) {
            }
        }
    };
    return Equilibrium;
}(BalancedRxn));
/**
 * An object that represents both an equilibrium and a binding between real substances
 *  such that Q can be calculated without worrying about the ordering of reactants and products
 */
var BoundEqb = /** @class */ (function () {
    function BoundEqb(parent) {
        this.rx = [];
        this.px = [];
        this.parent = parent;
    }
    BoundEqb.prototype.bindRx = function () {
        var _a;
        var sub = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sub[_i] = arguments[_i];
        }
        (_a = this.rx).push.apply(_a, sub);
    };
    BoundEqb.prototype.bindPx = function () {
        var _a;
        var sub = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sub[_i] = arguments[_i];
        }
        (_a = this.px).push.apply(_a, sub);
    };
    BoundEqb.prototype.Q = function () {
        return this.parent.Q(this.rx, this.px);
    };
    Object.defineProperty(BoundEqb.prototype, "K", {
        get: function () {
            return this.parent.K;
        },
        enumerable: false,
        configurable: true
    });
    return BoundEqb;
}());
var InteractionGroup = /** @class */ (function () {
    function InteractionGroup() {
        this.substs = [];
        this.eqbs = [];
    }
    InteractionGroup.prototype.step = function () {
        for (var _i = 0, _a = this.eqbs; _i < _a.length; _i++) {
            var eqb = _a[_i];
        }
    };
    return InteractionGroup;
}());
// class SystemEquilibrium {
// reactants: ProtoSubstance[] = [];
// products: ProtoSubstance[] = [];
// K: num = 1;
// sys: SubstGroup;
// reactants: Substance[] = [];
// products: Substance[] = [];
// constructor(sys: SubstGroup, eqb: EqbReaction) {
//     this.sys = sys;
//     for(let spec of sys.substances) {
//         if(eqb.reactants.indexOf(spec.type) >= 0) { // if the equilibrium has the species as a reactant
//             this.reactants.push(spec);
//         } else if (eqb.products.indexOf(spec.type) >= 0) {
//             this.products.push(spec);
//         }
//     }
// }
// }
