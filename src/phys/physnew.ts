// <reference path='../../raw/matter.min.js'/>

// import { Vector } from "matter-js";
type Vector = Matter.Vector;
// 
// import Matter  = require("../../raw/matter.min.js");

// Bridge between matter.js and the rest of my code
// 
interface Beakerlike extends Matter.Body{
    // rect: Matter.Body;
    size: Vector;
    pos: Vector;
    vel: Vector;
    substs?: System;
    // area: num; 10 area = 1 mL
}

function PhysicsHook2(arg1: Matter.Body | Vector, size: Vector, subst: Substance | System): Beakerlike {
    let body0: Matter.Body;
    if ('x' in arg1 && 'y' in arg1) {
        // Vector
        arg1 = arg1 as Vector;
        body0 = Matter.Bodies.rectangle(arg1.x, arg1.y, size.x, size.y, {
            restitution: 0
        });
        
    } else {
        body0 = arg1 as any;// Matter.Body;
    }
    let body = body0 as Matter.Body & { 'size': Vector, 'rect': Matter.Body, 'substs': System };//Matter.Body;
    body['size'] = size;
    body['rect'] = body0;
    body['substs'] = coerceToSystem(subst);
    Object.defineProperty(body, 'pos', {
        get: function () { return body.position },
        set: function (x) { body.position = x }
    });
    Object.defineProperty(body, 'vel', {
        get: function () { return body.velocity },
        set: function (x) { body.velocity = x }
    });
    return body as any;
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