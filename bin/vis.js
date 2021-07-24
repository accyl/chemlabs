"use strict";
/// <reference path='phys/physold.ts'/>
/// <reference path='chem.ts'/>
/// <reference path='color/colormodels.ts'/>
function phys(s, pos, size) {
    if (!s.physhook) {
        if (s instanceof System) {
            s.physhook = new PhysicsHook(pos, size);
            for (var _i = 0, _a = s.substances; _i < _a.length; _i++) {
                var subs = _a[_i];
                phys(subs);
            }
        }
        else if (s instanceof Substance) {
            s.physhook = new PhysicsHook(pos, size);
        }
        else {
            throw "Somehow passed arg was neither substance nor system? " + s;
        }
    }
    return s;
}
var Drawer = /** @class */ (function () {
    function Drawer() {
    }
    Drawer.prototype.draw = function (ctx, s) {
        if (s instanceof System) {
            s = s;
            for (var _i = 0, _a = s.substances; _i < _a.length; _i++) {
                var sub = _a[_i];
                this.draw(ctx, sub);
            }
            for (var _b = 0, _c = s.subsystems; _b < _c.length; _b++) {
                var subsys = _c[_b];
                this.draw(ctx, subsys);
            }
            ctx.beginPath();
            ctx.stroke();
            ctx.fillStyle = "#FFFFFFFF";
            if (!s.physhook)
                s = phys(s);
            ctx.fillRect(s.physhook.loc[0], s.physhook.loc[1], s.physhook.xsize, s.physhook.ysize);
            // the order kinda matters but I'll leave that up to custom drawers
            return;
        }
        else if (s instanceof Substance) {
            if (s instanceof AqueousSubstance) {
                ctx.beginPath();
                ctx.stroke();
                // ctx.fillStyle = "#" + s.color().join("");
                ctx.fillStyle = s.hexcolor();
                if (!s.physhook)
                    s = phys(s);
                if (!s.physhook)
                    throw "broke";
                ctx.fillRect(s.physhook.pos[0], s.physhook.pos[1], s.physhook.xsize, s.physhook.ysize);
                return;
            }
        }
    };
    return Drawer;
}());
var glob = new System();
phys(glob);
function tang(s, addToGlobal, pos, size) {
    if (addToGlobal === void 0) { addToGlobal = true; }
    var ret = phys(s);
    if (addToGlobal) {
        if (ret instanceof System) {
            glob.subsystems.push(ret);
        }
        else if (ret instanceof Substance) {
            glob.substances.push(ret);
        }
        else
            throw "s " + ret + "not instanceof System nor Substance!";
    }
    return ret;
}
var drawer = new Drawer(); // the principal drawer
function redraw(t) {
    var canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        var ctxt = canvas.getContext("2d");
        if (ctxt === null)
            throw "Context is null?";
        drawer.draw(ctxt, glob);
    }
    else {
        throw "Canvas doesn't exist?";
    }
}
function _componentToHex(c) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function _hex(r, g, b) {
    var extras = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        extras[_i - 3] = arguments[_i];
    }
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}
