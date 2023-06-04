// <reference path='../../raw/matter.min.js'/>

import Matter from "matter-js";
import { ChemComponent } from "./substance";

/** 
 * Bridge between matter.js and the rest of my code
 *  
 */
type Vector = Matter.Vector;


export interface PhysicsHook extends Matter.Body{
    // rect: Matter.Body;
    size: Vector;
    // pos: Vector;
    // vel: Vector;
    substs?: ChemComponent;
    ignoreGravity?: boolean;
    zIndex: num
    // area: num; 10 area = 1 mL
}
export enum PhysicsHookBehavior {
    FREE, BEAKER, CONSTRAINED
}
// export type WeakPhysicsHook = Matter.Body & { size: Vector, 
// rect: Matter.Body, substs: ChemComponents | undefined, ignoreGravity?:boolean, zIndex:num };
export function newPhysicsHook(arg1: Matter.Body | Vector, size: Vector, subst: ChemComponent ): PhysicsHook {
    let body0: Matter.Body;
    if ('x' in arg1 && 'y' in arg1) {
        // Vector
        arg1 = arg1 as Vector;
        body0 = Matter.Bodies.rectangle(arg1.x, arg1.y, size.x, size.y, {
            restitution: 0
        });
        
    } else {
        body0 = arg1 as Matter.Body;// Matter.Body;
    }
    let body = body0 as PhysicsHook; //, 'boundsOnly': boolean };//Matter.Body;
    body['size'] = size;
    // body['rect'] = body0;

    if(!subst || subst === ChemComponent.BOUNDS_ONLY) {
        // body['substs'] = SubstGroup.BOUNDS_ONLY;
        // body['substs'] = undefined;
        body['collisionFilter'] = CollisionFilters.BACKGROUND_GAS;
        body['ignoreGravity'] = true;
        body['label'] = 'Bound';
        body['render']['opacity'] = 0.1;
        body['render']['fillStyle'] = '#063e7b'; // standardize it, or else sometimes it's invisible
        body['zIndex'] = -10;

    } else {
        body['substs'] = subst; //coerceToSystem(subst);
        if (subst.state === 'g') {
            body['collisionFilter'] = CollisionFilters.GASLIKE;
            body['zIndex'] = -2;

        } else {
            body['collisionFilter'] = CollisionFilters.SOLID;
            body['zIndex'] = 0;

        }
        body['label'] = "" + subst; //.substances[0].type.chemicalFormula;

    }
    body.toString = () => {return `[PhysHook label="${body.label}" id=${body.id}]`}
    // Object.defineProperty(body, 'pos', {
    //     get: function () { return body.position },
    //     set: function (x) { body.position = x }
    // });
    // Object.defineProperty(body, 'vel', {
    //     get: function () { return body.velocity },
    //     set: function (x) { body.velocity = x }
    // });
    return body as any;
}

export function addToWorld(h: PhysicsHook | PhysicsHook[]) {
    Matter.Composite.add(universe.world, h);
    eventDispatch('matterCreated', {'matter': h});
}
export function newBounds(arg1: Matter.Body | Vector, size: Vector, addToGlobal=true) {
    let h = newPhysicsHook(arg1, size, ChemComponent.BOUNDS_ONLY);
    if(addToGlobal) addToWorld(h);
    return h;
}

/**
 * If s is a ChemComponent with no associated physicshook, then this function creates one for it.
 * This function will NOT give hooks for subcomponents
 * @param s 
 * @param pos 
 * @param size 
 * @returns 
 */
export function applyPhyshook<S extends ChemComponent>(s: S, pos?: [num, num], size?: [num, num],): S {
    if (s.physhook === undefined) {
        let vec;
        if (pos) {
            vec = { 'x': pos[0], 'y': pos[1] };
        } else {
            vec = { 'x': 100, 'y': 100 };
        }
        let vsize = undefined;
        if (size) {
            vsize = { 'x': size[0], 'y': size[1] };
        }
        if (s === ChemComponent.BOUNDS_ONLY) {
            assert(false, "Use newBounds()!");
        } else if (s instanceof ChemComponent) {
            // s.physhook = new PhysicsHook(pos, size);
            if(vsize === undefined) {
                // we assign size based on volume. 
                // TODO go from cubic volume calculation to sqrt volume calculation. both ways are viable
                // clamp each dimension to be between [10, 1000]
                // thus 1 L => 100x100
                let s0 = s.calc("volume");
                vsize = {
                    'x': Math.max(7, Math.min(100 * Math.cbrt(s0.volume), 500)), 
                    'y': Math.max(7, Math.min(100 * Math.cbrt(s0.volume), 500))};

                // honestly, for simplicity, we should just set the volume of the object to be some easily grabbable qty, then address
                // the real volume using custom appearances
                // if (vsize === undefined) vsize = { 'x': 100, 'y': 100 };
            }
            s.physhook = newPhysicsHook(vec, vsize, s); //new PhysicsHookNew(vec, vsize);
            s.physhook.render.fillStyle = s.hexcolor();
            s.physhook.render.lineWidth = 1;
            s.physhook.render.strokeStyle = '#888888'; // default

            addToWorld([s.physhook]); //.rect]);

        } else throw "Somehow passed arg was neither substance nor system? " + s;

    }
    return s;
}

export function applyPhyshookRecursive<S extends ChemComponent>(s: S, pos ?: [num, num], size ?: [num, num],): S {
    let ret = applyPhyshook(s, pos, size);
    for(let s of ret.subcomponents) {
        applyPhyshookRecursive(s);
    }
    return ret;
}
export function changePhyshookBehavior(x: PhysicsHook, b: PhysicsHookBehavior){
    let subst = assert(x.substs, "PhysicsHook must contain a substs in order to change that substance's behavior!");
    if(b === PhysicsHookBehavior.BEAKER) {
        x['collisionFilter'] = CollisionFilters.SOLID;
        x['ignoreGravity'] = undefined;
        // x['label'] = 'Bound';
        // x['render']['opacity'] = 0.1;
        x['zIndex'] = -1;
    } else if(b === PhysicsHookBehavior.FREE) {
        if (subst.substances.length === 1 && subst.s[0].state === 'g') {
            x['collisionFilter'] = CollisionFilters.GASLIKE;
            x['zIndex'] = -2;
            x['ignoreGravity'] = true;

        } else {
            x['collisionFilter'] = CollisionFilters.SOLID;
            x['zIndex'] = 0;
            x['ignoreGravity'] = false;


        }
    }
}