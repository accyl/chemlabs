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
            body['zIndex'] = -1;
        }
        else {
            body['collisionFilter'] = CollisionFilters.SOLID;
            body['zIndex'] = 0;
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
function phys(s, pos, size) {
    if (!s.physhook) {
        var vec = void 0;
        if (pos) {
            vec = { 'x': pos[0], 'y': pos[1] };
        }
        else {
            vec = { 'x': 100, 'y': 100 };
        }
        var vsize = void 0;
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
            for (var _i = 0, _a = s.substances; _i < _a.length; _i++) {
                var subs = _a[_i];
                phys(subs);
            }
        }
        else
            throw "Somehow passed arg was neither substance nor system? " + s;
    }
    return s;
}
