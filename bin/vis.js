"use strict";
/// <reference path='phys/physold.ts'/>
/// <reference path='chem.ts'/>
/// <reference path='color/colormodels.ts'/>
// <reference path='../raw/tut.matter.js'/>
// @ts-ignore
// let universe = universe ? universe : 0 as any;
function phys(s, pos, size) {
    if (!s.physhook) {
        var vec = void 0;
        if (pos) {
            vec = { 'x': pos[0], 'y': pos[1] };
        }
        else {
            vec = { 'x': 100, 'y': 100 };
        }
        var vsize = void 0;
        if (size) {
            vsize = { 'x': size[0], 'y': size[1] };
        }
        else {
            vsize = { 'x': 100, 'y': 100 };
        }
        if (s instanceof System) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = new PhysicsHookNew(vec, vsize);
            for (var _i = 0, _a = s.substances; _i < _a.length; _i++) {
                var subs = _a[_i];
                phys(subs);
            }
        }
        else if (s instanceof Substance) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = new PhysicsHookNew(vec, vsize);
            Matter.Composite.add(universe.world, [s.physhook.rect]);
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
            // ctx.beginPath();
            // ctx.stroke();
            var prevs = ctx.fillStyle;
            ctx.fillStyle = "#000000";
            if (!s.physhook)
                s = phys(s);
            // ctx.fillRect(s.physhook.loc[0], s.physhook.loc[1], s.physhook.xsize, s.physhook.ysize);
            if (!s.physhook)
                throw "broke";
            this.drawB(ctx, s.physhook.rect);
            ctx.fillStyle = prevs;
            // the order kinda matters but I'll leave that up to custom drawers
            return;
        }
        else if (s instanceof Substance) {
            if (s instanceof AqueousSubstance) {
                // ctx.beginPath();
                // ctx.stroke();
                // ctx.fillStyle = "#" + s.color().join("");
                var prevs = ctx.fillStyle;
                ctx.fillStyle = s.hexcolor();
                if (!s.physhook)
                    s = phys(s);
                if (!s.physhook)
                    throw "broke";
                this.drawB(ctx, s.physhook.rect);
                // ctx.fillRect(s.physhook.pos.x, s.physhook.pos.y, s.physhook.size.x, s.physhook.size.y);
                ctx.fillStyle = prevs;
                return;
            }
        }
    };
    Drawer.prototype.drawC = function (ctx, cs) {
        // ctx.stroke();
        ctx.strokeStyle = '#888888';
        for (var _i = 0, _a = Matter.Composite.allBodies(cs); _i < _a.length; _i++) {
            var b = _a[_i];
            this.drawB(ctx, b);
        }
    };
    Drawer.prototype.drawB = function (ctx, b) {
        var vs = b.vertices;
        ctx.beginPath();
        ctx.moveTo(vs[0].x, vs[0].y);
        for (var i = 1; i < vs.length; i++) {
            var v = vs[i];
            ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
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
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.fillStyle = '#000000';
        drawer.drawC(ctxt, universe.world);
        drawer.draw(ctxt, glob);
    }
    else {
        throw "Canvas doesn't exist?";
    }
}
(function () {
    var func = function () {
        redraw();
        requestAnimationFrame(func);
    };
    window.requestAnimationFrame(func);
})();
