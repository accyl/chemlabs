"use strict";
// import { Vector } from "matter-js";
var __ = undefined;
var gvar = {};
var universe = {};
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
