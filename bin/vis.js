"use strict";
/// <reference path='chem.ts'/>
/// <reference path='color/colormodels.ts'/>
// <reference path='../raw/tut.matter.js'/>
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
        if (s instanceof Substance) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = newPhysicsHook(vec, vsize, s); //new PhysicsHookNew(vec, vsize);
            Matter.Composite.add(universe.world, [s.physhook]); //.rect]);
        }
        else if (s === SubstGroup.BOUNDS_ONLY) {
            assert(false, "Use newBounds()!");
        }
        else if (s instanceof SubstGroup) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = newPhysicsHook(vec, vsize, s); // new PhysicsHookNew(vec, vsize);
            for (var _i = 0, _a = s.substances; _i < _a.length; _i++) {
                var subs = _a[_i];
                phys(subs);
            }
        }
        else
            throw "Somehow passed arg was neither substance nor system? " + s;
    }
    return s;
}
var Drawer = /** @class */ (function () {
    function Drawer() {
    }
    Drawer.prototype.draw = function (ctx, s) {
        if (s instanceof Substance) {
            // if (s instanceof AqueousSubstance) {
            // ctx.beginPath();
            // ctx.stroke();
            // ctx.fillStyle = "#" + s.color().join("");
            var prevs = ctx.fillStyle;
            ctx.fillStyle = s.hexcolor();
            if (!s.physhook)
                s = phys(s);
            if (!s.physhook)
                throw "broke";
            this.drawB(ctx, s.physhook); //.rect);
            // ctx.fillRect(s.physhook.pos.x, s.physhook.pos.y, s.physhook.size.x, s.physhook.size.y);
            ctx.fillStyle = prevs;
            return;
            // }
        }
        else if (s instanceof SubstGroup) {
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
            // let prevs = ctx.fillStyle;
            // ctx.fillStyle = "#FFFFFFFF";
            // if (!s.physhook) s = phys(s);
            // ctx.fillRect(s.physhook.loc[0], s.physhook.loc[1], s.physhook.xsize, s.physhook.ysize);
            // if (!s.physhook) throw "broke";
            // this.drawB(ctx, s.physhook.rect);
            // ctx.fillStyle = prevs;
            // the order kinda matters but I'll leave that up to custom drawers
            // actually let's not draw Systems
            // Also Systems correspond to Composites extremely closely - reduce objects
            return;
        }
        else
            throw "Somehow passed arg was neither substance nor system? " + s;
    };
    Drawer.prototype.drawC = function (ctx, cs) {
        // ctx.stroke();
        ctx.strokeStyle = '#888888';
        for (var _i = 0, _a = Matter.Composite.allBodies(cs); _i < _a.length; _i++) {
            var b_1 = _a[_i];
            if ('substs' in b_1)
                continue; // skip it to avoid duplicates
            this.drawB(ctx, b_1);
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
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var Global = /** @class */ (function (_super) {
    __extends(Global, _super);
    function Global() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.solids_i = 0;
        _this.gases_i = 0;
        _this.liquids_i = 0;
        return _this;
    }
    Global.prototype.addSubst = function (s) {
        if (s.state === 'g') {
            this.substances.splice(this.gases_i, 0, s); // insert at index of gases_idx
            this.gases_i++;
            this.liquids_i++;
            this.solids_i++;
        }
        else if (s.state === 'l') {
            this.substances.splice(this.liquids_i, 0, s); // insert at index
            this.liquids_i++;
            this.solids_i++;
        }
        else if (s.state === 'l') {
            this.substances.splice(this.solids_i, 0, s); // insert at index
            this.solids_i++;
        }
        else {
            this.substances.push(s);
        }
    };
    return Global;
}(SubstGroup));
var glob = new Global();
phys(glob, [0, 0], [canvas.width, canvas.height]);
var b = newBounds({ x: 0, y: 0 }, { x: canvas.width / 2, y: canvas.height / 2 });
function tang(s, addToGlobal, pos, size) {
    if (addToGlobal === void 0) { addToGlobal = true; }
    var ret = phys(s);
    if (addToGlobal) {
        if (ret instanceof Substance) {
            // glob.substances.push(ret);
            glob.addSubst(ret);
        }
        else if (ret instanceof SubstGroup) {
            glob.subsystems.push(ret);
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
function updateZIndex() {
    // basically, move gases towards the front of the so they're drawn behind solids
    // TODO: reorder universe.world according to glob
}
(function () {
    var func = function () {
        redraw();
        requestAnimationFrame(func);
    };
    window.requestAnimationFrame(func);
})();
