// <reference path='../../raw/matter.min.js'/>

// import { Vector } from "matter-js";
type Vector = Matter.Vector;
// 
// import Matter  = require("../../raw/matter.min.js");

// Bridge between matter.js and the rest of my code
// 

interface PhysicsHook extends Matter.Body{
    // rect: Matter.Body;
    size: Vector;
    pos: Vector;
    vel: Vector;
    substs?: SubstGroup;
    // area: num; 10 area = 1 mL
}
type WeakPhysHook = Matter.Body & { size: Vector, 
rect: Matter.Body, substs: SubstGroup | undefined, ignoreGravity?:boolean };
function newPhysicsHook(arg1: Matter.Body | Vector, size: Vector, subst: Substance | SubstGroup): PhysicsHook {
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
    let body = body0 as WeakPhysHook; //, 'boundsOnly': boolean };//Matter.Body;
    body['size'] = size;
    body['rect'] = body0;
    if(!subst || subst === SubstGroup.BOUNDS_ONLY) {
        // body['substs'] = SubstGroup.BOUNDS_ONLY;
        // body['substs'] = undefined;
        body['collisionFilter'] = CollisionFilters.GASLIKE;
        body['ignoreGravity'] = true;
        body['label'] = 'Bound';
        body['render']['opacity'] = 0.1;

    } else {
        body['substs'] = subst; //coerceToSystem(subst);
        if (subst.substances.length === 1 && subst.s[0].state === 'g') {
            body['collisionFilter'] = CollisionFilters.GASLIKE;
        } else {
            body['collisionFilter'] = CollisionFilters.SOLID;
        }
        body['label'] = "" + subst; //.substances[0].type.chemicalFormula;

    }
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
function newBounds(arg1: Matter.Body | Vector, size: Vector, addToGlobal=true) {
    let h = newPhysicsHook(arg1, size, SubstGroup.BOUNDS_ONLY);
    if(addToGlobal) {
        Matter.Composite.add(universe.world, h);
    }
    return h;
}

function phys<S extends Substance | SubstGroup>(s: S, pos?: [num, num], size?: [num, num],): S {
    if (!s.physhook) {
        let vec;
        if (pos) {
            vec = { 'x': pos[0], 'y': pos[1] };
        } else {
            vec = { 'x': 100, 'y': 100 };
        }
        let vsize;
        if (size) {
            vsize = { 'x': size[0], 'y': size[1] };
        } else {
            vsize = { 'x': 100, 'y': 100 };
        }
        if (s instanceof Substance) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = newPhysicsHook(vec, vsize, s); //new PhysicsHookNew(vec, vsize);
            Matter.Composite.add(universe.world, [s.physhook]); //.rect]);

        } else if (s === SubstGroup.BOUNDS_ONLY) {
            assert(false, "Use newBounds()!");
        } else if (s instanceof SubstGroup) {
            // s.physhook = new PhysicsHook(pos, size);

            s.physhook = newPhysicsHook(vec, vsize, s); // new PhysicsHookNew(vec, vsize);

            for (let subs of s.substances) {
                phys(subs);
            }


        } else throw "Somehow passed arg was neither substance nor system? " + s;

    }
    return s;
}