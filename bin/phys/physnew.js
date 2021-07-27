"use strict";
// <reference path='../../raw/matter.min.js'/>
// 
// import Matter  = require("../../raw/matter.min.js");
// Bridge between matter.js and the rest of my code
// 
var PhysicsHookNew = /** @class */ (function () {
    function PhysicsHookNew(pos, size) {
        this.size = size;
        var options = {
            restitution: 0
        };
        this.rect = Matter.Bodies.rectangle(pos.x, pos.y, size.x, size.y, options);
    }
    Object.defineProperty(PhysicsHookNew.prototype, "pos", {
        get: function () {
            return this.rect.position;
        },
        set: function (x) {
            this.rect.position = x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhysicsHookNew.prototype, "vel", {
        get: function () {
            return this.rect.velocity;
        },
        set: function (x) {
            this.rect.velocity = x;
        },
        enumerable: false,
        configurable: true
    });
    return PhysicsHookNew;
}());
