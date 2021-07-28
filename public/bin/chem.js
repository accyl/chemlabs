"use strict";
/// <reference path='phys/physold.ts'/>
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
var Constants = /** @class */ (function () {
    function Constants() {
    }
    Constants.R = 8.31446261815324; // (J)/(K-mol) = 
    Constants.Ratm = 0.082057366080960; // (L-atm)/(K-mol)
    return Constants;
}());
var SubstanceType = /** @class */ (function () {
    function SubstanceType() {
        // intrinsic, intensive properties go here like density
        this.density = 1; // g/mL
        this.specificHeatCapacity = 0; // J/(g-K)
        this.chemicalFormula = "";
        /**
         * @deprecated I was wrong. You can't use spectral data for only 3 specific wavelengths to predict rgb
         * */
        this.molar_absorptivity = [1, 1, 1];
        this.rgb = [255, 255, 255];
        this.state = "g";
        this.molarMass = -1;
    }
    SubstanceType.NONE = new SubstanceType();
    return SubstanceType;
}());
var ProtoSubstance = /** @class */ (function (_super) {
    __extends(ProtoSubstance, _super);
    function ProtoSubstance() {
        return _super.call(this) || this;
    }
    ProtoSubstance.prototype.args = function () {
        // I would have prefered the function name mitosis(), but unfortunately there's no easy verb form for mitosis
        var retn = new ProtoSubstanceWithArgs(this);
        return retn;
    };
    ProtoSubstance.prototype.amt = function (qty, state) {
        var qbdr;
        if (qty instanceof QtyUnitList) {
            qbdr = qty.toBuilder();
        }
        else
            qbdr = qty;
        var ret = new ProtoSubstanceWithArgs(this);
        if (state)
            ret.setState(state);
        ret.mass = qbdr.mass;
        ret.mol = qbdr.mol;
        if (qbdr.volume)
            ret.volmL = qbdr.volume * 1000;
        else
            ret.volmL = qbdr.volume;
        return ret.form();
        // return ret;
    };
    ProtoSubstance.prototype._getProtoSubstanceWithArgsOf = function (args) {
        return this; // doesn't work right now
    };
    /**
     * Shortcut for getting one with default args
     * @returns
     */
    ProtoSubstance.prototype.form = function () {
        return new Substance(this);
    };
    ProtoSubstance.NONE = new ProtoSubstance();
    return ProtoSubstance;
}(SubstanceType));
var ProtoSubstanceWithArgs = /** @class */ (function () {
    function ProtoSubstanceWithArgs(ps) {
        this.ps = ps;
    }
    ProtoSubstanceWithArgs.prototype.gettype = function () {
        var _ps = this.ps._getProtoSubstanceWithArgsOf(this);
        // let retn = Object.create(_ps);
        // Object.freeze(retn); // make it immutable
        return _ps;
    };
    ProtoSubstanceWithArgs.prototype.form = function () {
        var ret = this.gettype().form();
        if (this.mass)
            ret.mass = this.mass;
        if (this.mol && ret instanceof MolecularSubstance)
            ret.mol = this.mol;
        if (this.volmL)
            ret.volume = this.volmL / 1000;
        return ret;
    };
    ProtoSubstanceWithArgs.prototype.setState = function (stateOfMatter) {
        this.state = stateOfMatter;
        return this;
    };
    /**
     * @deprecated
     * @param amt
     * @returns
     */
    ProtoSubstanceWithArgs.prototype.amt = function (amt) {
        if (typeof amt == 'number') {
            // assume mol
            this.mol = amt;
        }
        else if (typeof amt == 'string') {
            amt = amt;
            var cut = undefined;
            if (amt.slice(-3) == 'mol') {
                amt = amt.slice(0, -3);
                if (amt.slice(-1) == ' ')
                    amt = amt.slice(0, -1); // remove space
                this.mol = parseInt(amt);
            }
            else if ((cut = amt.slice(-2)) == 'mL' || cut == 'ml') {
                amt = amt.slice(0, -2);
                if (amt.slice(-1) == ' ')
                    amt = amt.slice(0, -1); // remove space
                this.volmL = parseInt(amt);
            }
            else if ((cut = amt.slice(-1)) == 'g') {
                amt = amt.slice(0, -1);
                if (amt.slice(-1) == ' ')
                    amt = amt.slice(0, -1); // remove space
                this.mass = parseInt(amt);
            }
            else if (cut == 'L' || cut == 'l') {
                amt = amt.slice(0, -2);
                if (amt.slice(-1) == ' ')
                    amt = amt.slice(0, -1); // remove space
                this.volmL = parseInt(amt) * 1000;
            }
        }
        else
            throw "amt isn't a str nor num";
        return this;
    };
    return ProtoSubstanceWithArgs;
}());
// function _componentToHex2(c: number) {
//     var hex = Math.round(c).toString(16);
//     return hex.length == 1 ? "0" + hex : hex;
// }
// function _rgbToHex(r: num, g: num, b: num) {
//     return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
// }
// alert(rgbToHex(0, 51, 255)); // #0033ff
var Substance = /** @class */ (function () {
    function Substance(type) {
        // loc: Locatable = Locatable.NONE;
        this.physhook = undefined;
        this._v = 1;
        this._T = 0;
        this.type = type ? type : SubstanceType.NONE;
        this.state = type ? type.state : "";
    }
    Object.defineProperty(Substance.prototype, "mass", {
        // mol = 0; 
        get: function () {
            return this.type.density * this.volume;
        },
        set: function (mass) {
            this.volume = mass / this.type.density;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Substance.prototype, "volume", {
        get: function () {
            return this._v;
        },
        set: function (volume) {
            this._v = volume;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Substance.prototype, "temperature", {
        get: function () {
            return this._T;
        },
        set: function (T) {
            this._T = T;
        },
        enumerable: false,
        configurable: true
    });
    Substance.prototype.kValue = function () {
        return 1; // returns the value used in the equilibrium expression. setting it to 1 will ignore it.
        // this is usually the molarity
    };
    Substance.prototype.color = function (background) {
        if (background === void 0) { background = [255, 255, 255]; }
        return this.type.rgb;
    };
    Substance.prototype.hexcolor = function (background) {
        if (background === void 0) { background = [255, 255, 255]; }
        var c = this.color(background);
        return _hex.apply(void 0, c);
    };
    return Substance;
}());
var MolecularSubstance = /** @class */ (function (_super) {
    __extends(MolecularSubstance, _super);
    // molarMass = 1;
    // type2: MolecularSubstanceType;
    function MolecularSubstance(type) {
        var _this = _super.call(this, type) || this;
        _this.mol = 1;
        return _this;
        // TODO Hacky dumb solution. THeoretically solvable by generics but I have to refactor a constructor & it's a headache
        // this.type2 = type;
    }
    Object.defineProperty(MolecularSubstance.prototype, "molarMass", {
        get: function () {
            return this.type.molarMass;
        },
        set: function (s) {
            this.type.molarMass = s;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MolecularSubstance.prototype, "mass", {
        get: function () {
            return this.mol * this.molarMass;
        },
        set: function (mass) {
            this.mol = mass / this.molarMass;
        },
        enumerable: false,
        configurable: true
    });
    return MolecularSubstance;
}(Substance));
var GaseousSubstance = /** @class */ (function (_super) {
    __extends(GaseousSubstance, _super);
    function GaseousSubstance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(GaseousSubstance.prototype, "pressure", {
        // PV=nRT
        // P = nRT/V
        get: function () {
            return this.mol * Constants.Ratm * this.temperature / this.volume;
        },
        enumerable: false,
        configurable: true
    });
    GaseousSubstance.prototype.kValue = function () {
        return this.pressure;
    };
    return GaseousSubstance;
}(MolecularSubstance));
var AqueousSubstance = /** @class */ (function (_super) {
    __extends(AqueousSubstance, _super);
    function AqueousSubstance(solutetype, solvent) {
        var _this = _super.call(this, solutetype) || this;
        _this.maxConcentration = Number.POSITIVE_INFINITY; // Also called the maximum solubility
        _this.solvent = solvent;
        return _this;
    }
    Object.defineProperty(AqueousSubstance.prototype, "concentration", {
        get: function () {
            return this.mol / (this.solvent.volume); // TODO: usually this.volume will be negligible.
        },
        set: function (val) {
            // we probably can assume that they want to change mols, not volume
            if (val > this.maxConcentration) {
                // TODO supersaturated. Actually normally this would be 
                // solved using equilibria but it's not implemented yet
                // so let's just reject it for now
                return;
            }
            var molneeded = val * this.solvent.volume;
            // we assume that the volume of solute is negligible
            // because technically molarity is volume of solution, not
            // volume of solvent
            this.mol = molneeded;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AqueousSubstance.prototype, "volume", {
        get: function () {
            return this.solvent.volume;
        },
        set: function (val) {
            // they probably want to change the solvent volume
            this.solvent.volume = val;
        },
        enumerable: false,
        configurable: true
    });
    AqueousSubstance.prototype.kValue = function () {
        return this.concentration;
    };
    AqueousSubstance.prototype.absorbance = function (length_traveled) {
        var _this = this;
        if (length_traveled === void 0) { length_traveled = 1; }
        // A = ε * l * ç
        // ε = molar absorptivity
        // l = length traveled
        // ç = concentration
        // here we generalize molar_absorptivity
        return this.type.molar_absorptivity.map(function (x) { return x * length_traveled * _this.concentration; });
        // A = -log(T) = log(1/transmittance) = -log (transmittance) = -log(%light passing through / total light)
        // -A = log(T) T = 10^(-A)
    };
    AqueousSubstance.prototype.transmittance = function (length_traveled) {
        var _this = this;
        if (length_traveled === void 0) { length_traveled = 1; }
        return this.type.molar_absorptivity.map(function (x) { return Math.pow(10, -x * length_traveled * _this.concentration / 100); }); // / 100000));
    };
    AqueousSubstance.prototype.color = function (background, l) {
        if (background === void 0) { background = [255, 255, 255]; }
        if (l === void 0) { l = 1; }
        return this.transmittance(l).map(function (x, i) { return x * background[i]; }); // we assume that we're plotting it against a white
    };
    return AqueousSubstance;
}(MolecularSubstance));
var SpectralAqueousSubstance = /** @class */ (function (_super) {
    __extends(SpectralAqueousSubstance, _super);
    function SpectralAqueousSubstance(solute, solvent, spectra_f) {
        var _this = _super.call(this, solute, solvent) || this;
        _this.spectra_f = spectra_f;
        return _this;
    }
    SpectralAqueousSubstance.prototype._shortcut = function (x) {
        return f_daylight(x) * transmittance(this.spectra_f(x), this.concentration);
    };
    SpectralAqueousSubstance.prototype.color = function (background, l) {
        var _this = this;
        if (background === void 0) { background = [255, 255, 255]; }
        if (l === void 0) { l = 1; }
        return rgb_from_spectrum(function (x) { return f_daylight(x) * transmittance(_this.spectra_f(x), _this.concentration); });
    };
    return SpectralAqueousSubstance;
}(AqueousSubstance));
var BalancedRxn = /** @class */ (function () {
    function BalancedRxn() {
        this.reactants = [];
        this.products = [];
        // constructor(reactants: SubstanceType[], products: SubstanceType[]) {
        //     this.reactants = reactants;
        //     this.products = products;
        // }
    }
    return BalancedRxn;
}());
var EqbReaction = /** @class */ (function (_super) {
    __extends(EqbReaction, _super);
    function EqbReaction(K) {
        var _this = 
        // TODO
        _super.call(this) || this;
        _this.K = 1;
        _this.K = K;
        return _this;
    }
    return EqbReaction;
}(BalancedRxn));
var System = /** @class */ (function () {
    function System() {
        this.substances = [];
        this.equilibria = [];
        this.subsystems = [];
    }
    Object.defineProperty(System.prototype, "s", {
        get: function () { return this.substances; },
        enumerable: false,
        configurable: true
    });
    System.prototype.getSubstance = function (key) {
        return this.substances[key];
    };
    return System;
}());
var SystemEquilibrium = /** @class */ (function () {
    function SystemEquilibrium(sys, eqb) {
        this.reactants = [];
        this.products = [];
        this.sys = sys;
        for (var _i = 0, _a = sys.substances; _i < _a.length; _i++) {
            var spec = _a[_i];
            if (eqb.reactants.indexOf(spec.type) >= 0) { // if the equilibrium has the species as a reactant
                this.reactants.push(spec);
            }
            else if (eqb.products.indexOf(spec.type) >= 0) {
                this.products.push(spec);
            }
        }
    }
    Object.defineProperty(SystemEquilibrium.prototype, "Q", {
        get: function () {
            var Rs = 1;
            for (var _i = 0, _a = this.reactants; _i < _a.length; _i++) {
                var rxt = _a[_i];
                Rs *= rxt.kValue();
            }
            var Ps = 1;
            for (var _b = 0, _c = this.products; _b < _c.length; _b++) {
                var px = _c[_b];
                Ps *= px.kValue();
            }
            return Rs / Ps;
        },
        enumerable: false,
        configurable: true
    });
    return SystemEquilibrium;
}());
