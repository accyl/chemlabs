"use strict";
// import { Vector } from "matter-js";
var __ = undefined;
var gvar = {};
var lastClickedObject = undefined;
// type vec = Vector;
var _hex = function () {
    function _componentToHex(c) {
        var hex = Math.round(Math.min(c, 255)).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    var hex = function (r, g, b) {
        var extras = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            extras[_i - 3] = arguments[_i];
        }
        return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
    };
    return hex;
}();
function _rgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
var CollisionFilters = /** @class */ (function () {
    // all 0b111...1101 except category 2
    function CollisionFilters(category, mask, group) {
        if (group === void 0) { group = 0; }
        this.group = 0;
        if (group)
            this.group = group;
        if (category)
            this.category = category;
        if (mask)
            this.mask = mask;
    }
    CollisionFilters.SOLID = new CollisionFilters(1, 0xFFFFFFFF);
    CollisionFilters.MOUSE = new CollisionFilters(2, 0xFFFFFFFF);
    CollisionFilters.WALL = new CollisionFilters(4, 0xFFFFFFFF);
    CollisionFilters.GASLIKE = new CollisionFilters(8, 2 + 4); // only collide with walls and the mouse constraint
    return CollisionFilters;
}());
var universe = {};
