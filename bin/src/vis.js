"use strict";
/// <reference path='phys.ts'/>
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
                ctx.fillStyle = s.rgb();
                if (!s.physhook)
                    s = phys(s);
                if (!s.physhook)
                    throw "broke";
                ctx.fillRect(s.physhook.loc.pos()[0], s.physhook.loc.pos()[1], s.physhook.xsize, s.physhook.ysize);
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
function defButton() {
    var sub = KMnO4.form();
    tang(sub);
    redraw();
}
function _componentToHex(c) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function _hex(r, g, b) {
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}
function slider() {
    var h = document.querySelector("#slider");
    var s = glob.s[0];
    s.concentration = h.value / 10000000;
    redraw();
    var canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        var ctxt = canvas.getContext("2d");
        if (ctxt === null)
            throw "Context is null?";
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 1000)));
        // let m = rgb_from_spectrum(f_daylight);
        var m = rgb_from_spectrum(function (x) { return transmittance(spectra_kmno4_f(x), h.value / 10); });
        ctxt.beginPath();
        ctxt.stroke();
        // console.log(m);
        ctxt.fillStyle = _hex(m[0], m[1], m[2]);
        ctxt.fillRect(0, 10, 10, 10);
        var n = rgb_from_spectrum(function (x) { return f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 10); });
        ctxt.beginPath();
        ctxt.stroke();
        // console.log(m);
        ctxt.fillStyle = _hex(n[0], n[1], n[2]);
        ctxt.fillRect(0, 20, 10, 10);
    }
    // rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
}
function graph(f, start, end) {
    if (start === void 0) { start = 360; }
    if (end === void 0) { end = 830; }
    // if(!f) f = f_daylight;
    if (!f)
        f = spectra_kmno4_f;
    var canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        var ctxt = canvas.getContext("2d");
        if (ctxt === null)
            throw "Context is null?";
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_fluor_white(x)));
        for (var i = start; i < end; i++) {
            ctxt.beginPath();
            // ctxt.stroke();
            // ctxt.fillRect()
            ctxt.fillStyle = '#FF0000';
            ctxt.fillRect(0.6 * (i - start), 130 * (1 - f(i)) + 10, 0.6, 1);
        }
    }
}
