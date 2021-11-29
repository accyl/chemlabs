"use strict";
// <reference path='phys/physold.ts'/>
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
    SubstanceType.prototype.equals = function (x) {
        console.warn("unimplemented equals in chemm.ts SubstanceType!");
        return this == x;
    };
    SubstanceType.NONE = new SubstanceType();
    return SubstanceType;
}());
var ProtoSubstance = /** @class */ (function (_super) {
    __extends(ProtoSubstance, _super);
    function ProtoSubstance() {
        return _super.call(this) || this;
    }
    ProtoSubstance.prototype.amt = function (qty, state) {
        var args = new PSArgs(this, qty);
        if (state)
            args.state = state;
        return args.form();
    };
    ProtoSubstance.prototype._getWithArgs = function (args) {
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
var PSArgs = /** @class */ (function () {
    function PSArgs(ps, qty, state) {
        this.ps = ps;
        var qbdr;
        if (qty instanceof QtyUnitList) {
            qbdr = qty.toBuilder();
            if (!(qbdr.mass || qbdr.mol || qbdr.volume))
                qbdr.mol = 1; // set a default
        }
        else
            qbdr = qty;
        if (qbdr) {
            this.mass = qbdr.mass;
            this.mol = qbdr.mol;
            if (qbdr.volume)
                this.volmL = qbdr.volume * 1000;
            else
                this.volmL = qbdr.volume;
        }
    }
    PSArgs.prototype.getProto = function () {
        return this.ps._getWithArgs(this);
    };
    PSArgs.prototype.form = function () {
        var ret = this.getProto().form();
        if (this.mass)
            ret.mass = this.mass;
        if (this.mol && ret instanceof MolecularSubstance)
            ret.mol = this.mol;
        if (this.volmL)
            ret.volume = this.volmL / 1000;
        return ret;
    };
    return PSArgs;
}());
/**
 * Coerce a substance into basically being a unit system
 * Not needed since Substances are already SubstGroups
 * @param x
 * @deprecated
 */
function coerceToSystem(x) {
    // if(!x) return undefined;
    var a = x;
    if ('substances' in x && 'equilibria' in x && 'subsystems' in x)
        return x;
    if ('substances' in x || 'equilibria' in x || 'subsystems' in x)
        throw "partially initialized substance/system hybrid: " + x;
    a['substances'] = [a];
    a['equilibria'] = [];
    a['subsystems'] = [];
    a.getSubstance = function () { return a; };
    return a;
}
var SubstGroup = /** @class */ (function () {
    function SubstGroup() {
        this.substances = [];
        this.subsystems = [];
    }
    Object.defineProperty(SubstGroup.prototype, "s", {
        get: function () { return this.substances; },
        enumerable: false,
        configurable: true
    });
    SubstGroup.prototype.getSubstance = function (key) {
        if (key === void 0) { key = 0; }
        return this.substances[key];
    };
    SubstGroup.prototype.toString = function () {
        return "[" + ("" + this.substances) + "]";
    };
    SubstGroup.BOUNDS_ONLY = new SubstGroup(); // pass this to newPhysicsHook to have a bounds-only physhook
    return SubstGroup;
}());
/*
var handler = {
    get: function(target, name) {
        if (name in target) {
            return target[name];
        }
        if (name == 'length') {
            return Infinity;
        }
        return name * name;
    }
};
var p = new Proxy({}, handler);

p[4]; //returns 16, which is the square of 4.
*/
var Substance = /** @class */ (function (_super) {
    __extends(Substance, _super);
    function Substance(type) {
        var _this = _super.call(this) || this;
        _this.subsystems = [];
        _this._v = 1;
        _this._T = 273.15;
        _this.type = type ? type : SubstanceType.NONE;
        _this.state = type ? type.state : "";
        var a = [];
        a.push(_this);
        _this.substances = a;
        return _this;
    }
    Substance.prototype.getSubstance = function (key) { return this; };
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
    Substance.prototype.color = function (background) {
        if (background === void 0) { background = [255, 255, 255]; }
        return this.type.rgb;
    };
    Substance.prototype.hexcolor = function (background) {
        if (background === void 0) { background = [255, 255, 255]; }
        var c = this.color(background);
        return _hex.apply(void 0, c);
    };
    Substance.prototype.toString = function () {
        return this.type.chemicalFormula + " " + this.mass + "g";
    };
    return Substance;
}(SubstGroup));
function makeMolecular(s) {
    var molec = s;
    Object.defineProperty(molec, 'molarMass', {
        get: function () { return molec.type.molarMass; },
        set: function (x) { molec.type.molarMass = x; }
    });
    molec['mol'] = 1;
    Object.defineProperty(molec, 'molarMass', {
        get: function () { return molec.mol * molec.molarMass; },
        set: function (mass) { molec.mol = mass / molec.molarMass; }
    });
    return molec;
}
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
function makeGaseous(x) {
    assert('mol' in x, x + " is somehow not a molecular substance?");
    // how
    var gas = x;
    Object.defineProperty(gas, 'pressure', {
        get: function () { return this.mol * Constants.Ratm * this.temperature / this.volume; }
        // set: function (x) { molec.type.molarMass = x }
    });
}
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
