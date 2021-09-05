"use strict";
// <reference path='chem.ts'/>
// <reference path='color/colormodels.ts'/>
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
// import _ from "lodash";
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
            // let preva = ctx.globalAlpha;
            ctx.fillStyle = s.hexcolor();
            if (!s.physhook)
                s = phys(s);
            if (!s.physhook)
                throw "broke";
            // ctx.globalAlpha = s.physhook.render.opacity ? s.physhook.render.opacity : 1;
            this.drawB(ctx, s.physhook); //.rect);
            // ctx.fillRect(s.physhook.pos.x, s.physhook.pos.y, s.physhook.size.x, s.physhook.size.y);
            ctx.fillStyle = prevs;
            // ctx.globalAlpha = preva;
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
        var prev = ctx.strokeStyle;
        ctx.strokeStyle = '#888888';
        var preva = ctx.globalAlpha;
        for (var _i = 0, _a = Matter.Composite.allBodies(cs); _i < _a.length; _i++) {
            var b_1 = _a[_i];
            // @ts-ignore
            if ('substs' in b_1 && b_1['substs'])
                continue; // skip it to avoid duplicates
            if (b_1.render.opacity)
                ctx.globalAlpha = b_1.render.opacity;
            this.drawB(ctx, b_1);
        }
        ctx.strokeStyle = prev;
        ctx.globalAlpha = preva;
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
var b = newBounds({ x: canvas.width / 4, y: canvas.height / 4 }, { x: canvas.width / 2, y: canvas.height / 2 }); // canvas.width/2, y:canvas.height/2});
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
    var ctx = getCanvasContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    drawer.drawC(ctx, universe.world);
    drawer.draw(ctx, glob);
}
function updateZIndex() {
    // basically, move gases towards the front of the so they're drawn behind solids
    // TODO: reorder universe.world according to glob
    universe.world.bodies.sort(function (a, b) {
        // @ts-ignore
        var zIndexA = typeof a.zIndex !== 'undefined' ? a.zIndex : 0;
        // @ts-ignore
        var zIndexB = typeof b.zIndex !== 'undefined' ? b.zIndex : 0;
        return zIndexA - zIndexB;
    });
    // Matter.Composite.rebase(universe.world);
}
(function () {
    var func = function () {
        if (!universe.paused)
            redraw();
        requestAnimationFrame(func);
    };
    window.requestAnimationFrame(func);
})();
var ButtonManager = /** @class */ (function () {
    function ButtonManager() {
    }
    return ButtonManager;
}());
