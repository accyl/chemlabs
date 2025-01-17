"use strict";
// import { Vector } from "matter-js";
let __ = undefined;
let gvar = {};
let lastClickedObject = undefined;
// type vec = Vector;
function _componentToHex(c) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function _hex(r, g, b, ...extras) {
    if (Array.isArray(r)) {
        if (r.length !== 3)
            throw new Error("RGB array must be 3, but instead it is " + r.length);
        return _hex(r[0], r[1], r[2], ...extras);
    }
    if (g === undefined || b === undefined)
        throw new TypeError("Must provide r, g, and b");
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}
function _rgb(hex) {
    if (hex.startsWith('#'))
        hex = hex.substring(1);
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}
function assert(condition, message, hard = true) {
    if (!condition) {
        if (hard)
            throw new Error(message || "Assertion failed");
        else
            console.log(message || "Assertion failed :(");
    }
    return condition;
}
class CollisionFilters {
    // all 0b111...1101 except category 2
    constructor(category, mask, group = 0) {
        this.group = 0;
        if (group)
            this.group = group;
        if (category)
            this.category = category;
        if (mask)
            this.mask = mask;
    }
}
CollisionFilters.SOLID = new CollisionFilters(1, 0xFFFFFFFF);
CollisionFilters.MOUSE = new CollisionFilters(2, 0xFFFFFFFF);
CollisionFilters.WALL = new CollisionFilters(4, 0xFFFFFFFF);
CollisionFilters.BEAKER = new CollisionFilters(8, 0xFFFFFFFF);
CollisionFilters.GASLIKE = new CollisionFilters(16, 2 + 4 + 8); // only collide with walls, beakers, and the mouse constraint (allow it to be draggable)
CollisionFilters.BEAKER_PHANTOM = new CollisionFilters(32, 2 + 4 + 8); // this is a phantom object that acts as the glass screen of the beaker, but can't be interacted with by a mouse
CollisionFilters.BACKGROUND_GAS = new CollisionFilters(16, 2 + 4); // only collide with walls, beakers, and the mouse constraint (allow it to be draggable)
var ScreenState;
(function (ScreenState) {
    ScreenState[ScreenState["PAUSED"] = 0] = "PAUSED";
    ScreenState[ScreenState["RUNNING"] = 1] = "RUNNING";
    ScreenState[ScreenState["CREDITS"] = 2] = "CREDITS";
})(ScreenState || (ScreenState = {}));
let universe = { beakers: [] };
universe.paused = false;
function getCanvas() {
    let canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        return canvas;
    }
    else {
        throw new TypeError("Canvas doesn't exist?");
    }
}
function getCanvasContext(canvas) {
    if (!canvas) {
        canvas = getCanvas();
    }
    let ctxt = canvas.getContext("2d");
    if (ctxt === null)
        throw new TypeError("Context is null?");
    return ctxt;
}
function eventDispatch(eventName, eventInfo, extraSubcribers = '') {
    let subscribers = $('.subscribed, .inspector ' + extraSubcribers);
    subscribers.trigger(eventName, eventInfo);
}
// $('#einspector').on('substanceCreated', function (e, eventInfo) {
//     alert('(notifier1)The value of eventInfo is: ' + eventInfo);
// });
class Constants {
}
Constants.R = 8.31446261815324; // (J)/(K-mol) = 
Constants.Ratm = 0.082057366080960; // (L-atm)/(K-mol)
Constants.SIprefs = ['n', 'µ', 'm', 'c', 'd', '', 'k'];
Constants.SIprefscoeffs = [1e-9, 1e-6, 1e-3, 1e-2, 1e-1, 1, 1e3];
