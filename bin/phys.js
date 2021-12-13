"use strict";
// <reference path='../../raw/matter.min.js'/>
var PhysicsHookBehavior;
(function (PhysicsHookBehavior) {
    PhysicsHookBehavior[PhysicsHookBehavior["FREE"] = 0] = "FREE";
    PhysicsHookBehavior[PhysicsHookBehavior["BEAKER"] = 1] = "BEAKER";
    PhysicsHookBehavior[PhysicsHookBehavior["CONSTRAINED"] = 2] = "CONSTRAINED";
})(PhysicsHookBehavior || (PhysicsHookBehavior = {}));
function newPhysicsHook(arg1, size, subst) {
    let body0;
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
    let body = body0; //, 'boundsOnly': boolean };//Matter.Body;
    body['size'] = size;
    body['rect'] = body0;
    if (!subst || subst === SubstGroup.BOUNDS_ONLY) {
        // body['substs'] = SubstGroup.BOUNDS_ONLY;
        // body['substs'] = undefined;
        body['collisionFilter'] = CollisionFilters.GASLIKE;
        body['ignoreGravity'] = true;
        body['label'] = 'Bound';
        body['render']['opacity'] = 0.1;
        body['zIndex'] = -10;
    }
    else {
        body['substs'] = subst; //coerceToSystem(subst);
        if (subst.substances.length === 1 && subst.s[0].state === 'g') {
            body['collisionFilter'] = CollisionFilters.GASLIKE;
            body['zIndex'] = -2;
        }
        else {
            body['collisionFilter'] = CollisionFilters.SOLID;
            body['zIndex'] = 0;
        }
        body['label'] = "" + subst; //.substances[0].type.chemicalFormula;
    }
    // Object.defineProperty(body, 'pos', {
    //     get: function () { return body.position },
    //     set: function (x) { body.position = x }
    // });
    // Object.defineProperty(body, 'vel', {
    //     get: function () { return body.velocity },
    //     set: function (x) { body.velocity = x }
    // });
    return body;
}
function newBounds(arg1, size, addToGlobal = true) {
    let h = newPhysicsHook(arg1, size, SubstGroup.BOUNDS_ONLY);
    if (addToGlobal) {
        Matter.Composite.add(universe.world, h);
    }
    return h;
}
function phys(s, pos, size) {
    if (!s.physhook) {
        let vec;
        if (pos) {
            vec = { 'x': pos[0], 'y': pos[1] };
        }
        else {
            vec = { 'x': 100, 'y': 100 };
        }
        let vsize;
        if (size) {
            vsize = { 'x': size[0], 'y': size[1] };
        }
        else {
            vsize = { 'x': 100, 'y': 100 };
        }
        if (s instanceof Substance) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = newPhysicsHook(vec, vsize, s); //new PhysicsHookNew(vec, vsize);
            Matter.Composite.add(universe.world, [s.physhook]); //.rect]);
        }
        else if (s === SubstGroup.BOUNDS_ONLY) {
            assert(false, "Use newBounds()!");
        }
        else if (s instanceof SubstGroup) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = newPhysicsHook(vec, vsize, s); // new PhysicsHookNew(vec, vsize);
            for (let subs of s.substances) {
                phys(subs);
            }
        }
        else
            throw "Somehow passed arg was neither substance nor system? " + s;
    }
    return s;
}
function changePhyshookBehavior(x, b) {
    let subst = assert(x.substs, "PhysicsHook must contain a substs in order to change that substance's behavior!");
    if (b === PhysicsHookBehavior.BEAKER) {
        x['collisionFilter'] = CollisionFilters.SOLID;
        x['ignoreGravity'] = undefined;
        // x['label'] = 'Bound';
        // x['render']['opacity'] = 0.1;
        x['zIndex'] = -1;
    }
    else if (b === PhysicsHookBehavior.FREE) {
        if (subst.substances.length === 1 && subst.s[0].state === 'g') {
            x['collisionFilter'] = CollisionFilters.GASLIKE;
            x['zIndex'] = -2;
            x['ignoreGravity'] = true;
        }
        else {
            x['collisionFilter'] = CollisionFilters.SOLID;
            x['zIndex'] = 0;
            x['ignoreGravity'] = false;
        }
    }
}
