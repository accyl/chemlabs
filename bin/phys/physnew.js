"use strict";
// <reference path='../../raw/matter.min.js'/>
function newPhysicsHook(arg1, size, subst) {
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
    var body = body0; //, 'boundsOnly': boolean };//Matter.Body;
    body['size'] = size;
    body['rect'] = body0;
    if (!subst || subst === SubstGroup.BOUNDS_ONLY) {
        // body['substs'] = SubstGroup.BOUNDS_ONLY;
        body['substs'] = undefined;
        body['collisionFilter'] = CollisionFilters.GASLIKE;
        body['ignoreGravity'] = true;
        body['label'] = 'Bound';
    }
    else {
        body['substs'] = subst; //coerceToSystem(subst);
        if (subst.substances.length === 1 && subst.s[0].state === 'g') {
            body['collisionFilter'] = CollisionFilters.GASLIKE;
        }
        else {
            body['collisionFilter'] = CollisionFilters.SOLID;
        }
        body['label'] = "" + subst; //.substances[0].type.chemicalFormula;
    }
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
function newBounds(arg1, size, addToGlobal) {
    if (addToGlobal === void 0) { addToGlobal = true; }
    var h = newPhysicsHook(arg1, size, SubstGroup.BOUNDS_ONLY);
    if (addToGlobal) {
        Matter.Composite.add(universe.world, h);
    }
    return h;
}
