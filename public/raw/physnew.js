/// <reference path='matter.min.js'/>

class NewPhysicsHook {
    rect;
    constructor(pos, size) {
        this.rect = Matter.Bodies.rectangle(pos[0], pos[1], size[0], size[1]);
    }
}