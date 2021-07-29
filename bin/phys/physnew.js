"use strict";
// <reference path='../../raw/matter.min.js'/>
function PhysicsHook2(arg1, size, subst) {
    var body0;
    if ('x' in arg1 && 'y' in arg1) {
        // Vector
        arg1 = arg1;
        body0 = Matter.Bodies.rectangle(arg1.x, arg1.y, size.x, size.y, {
            restitution: 0
        });
    }
    else {
        body0 = arg1; // Matter.Body;
    }
    var body = body0; //Matter.Body;
    body['size'] = size;
    body['rect'] = body0;
    body['substs'] = coerceToSystem(subst);
    Object.defineProperty(body, 'pos', {
        get: function () { return body.position; },
        set: function (x) { body.position = x; }
    });
    Object.defineProperty(body, 'vel', {
        get: function () { return body.velocity; },
        set: function (x) { body.velocity = x; }
    });
    return body;
}
/*
class PhysicsHookNew { //implements PhysicsHookCommon {
    rect;
    readonly size;
    constructor(pos: Vector, size: Vector) {
        this.size = size;
        let options = {
            restitution: 0
        }
        this.rect = Matter.Bodies.rectangle(pos.x, pos.y, size.x, size.y, options);
        
    }
    get pos() {
        return this.rect.position;
    }
    set pos(x: Vector) {
        this.rect.position = x;
    }
    get vel() {
        return this.rect.velocity;
    }
    set vel(x: Vector) {
        this.rect.velocity = x;
    }


}
*/ 