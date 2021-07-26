// <reference path='../../raw/matter.min.js'/>

// import { Vector } from "matter-js";
type Vector = Matter.Vector;
// 
// import Matter  = require("../../raw/matter.min.js");

// Bridge between matter.js and the rest of my code
// 
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
