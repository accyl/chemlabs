import Matter from "matter-js";
import { EquilibriumAssigner } from "./interact";
import { PhysicsHook } from "./phys";
import { ChemComponent } from "./substance";


let tempViewportBound: Matter.Bounds;
function createTempViewportBoundIfNotAlready() {
    if (tempViewportBound === undefined) {
        let vertices: Matter.Vector[] = [];
        var canvas = document.getElementById('canvas') as HTMLCanvasElement;

        let tolerance = 80;
        vertices.push(Matter.Vector.create(0 - tolerance, 0 - tolerance));
        let othercorner = [canvas.width, canvas.height];
        vertices.push(Matter.Vector.create(othercorner[0] + tolerance, 0 - tolerance));
        vertices.push(Matter.Vector.create(othercorner[0] + tolerance, othercorner[1] + tolerance));
        vertices.push(Matter.Vector.create(0 - tolerance, othercorner[1] + tolerance));

        tempViewportBound = Matter.Bounds.create(Matter.Vertices.create(vertices, undefined!));
        return;
        // let bottomleft = { ...MatterObjects.idMap.get('lwall')!.bounds.min };
        // let topright = { ...MatterObjects.idMap.get('rwall')!.bounds.max };
        // let tol = 10; // tolerance
        // bottomleft.x -= tol;
        // bottomleft.y -= tol;
        // topright.x += tol;
        // topright.y += tol;
        // let size = [topright.x - bottomleft.x + tol*2, topright.y - bottomleft.y + tol*2];
        // internal.tempViewportBody = Matter.Bodies.fromVertices(0, 0, [[bottomleft], [topright]], { isStatic: true });
    }
}


export namespace Beaker {
    /**
     * O(n)
     * @param bodies 
     * @param beaker 
     * @returns 
     */
    export function allBodiesWithinBeaker(beaker: Beaker, bodies?: Matter.Body[]) {
        // return bodies.every(body => Matter.Query.point(beaker, body.position));
        if (bodies === undefined) bodies = Matter.Composite.allBodies(universe.world);
        
        return bodies.filter(body => isBodyInBeaker(body, beaker));

    }
    export function isBodyInBeaker(body: Matter.Body, beaker: Beaker) {
        return Matter.Bounds.contains(beaker.bounds, body.position)
            && Matter.Vertices.contains(beaker.vertices, body.position);
    }
}

export function isBodyInWorld(body: Matter.Body) {
    createTempViewportBoundIfNotAlready();
    return Matter.Bounds.contains(tempViewportBound, body.position);
}

export function allBodiesWithinViewport(bodies?: Matter.Body[], inside = true) {
    if (bodies === undefined) bodies = Matter.Composite.allBodies(universe.world);
    createTempViewportBoundIfNotAlready();
    if (inside) return bodies.filter(body => Matter.Bounds.contains(tempViewportBound, body.position));
    else return bodies.filter(body => !Matter.Bounds.contains(tempViewportBound, body.position));
    // all bodies outside viewport - AKA, they teleported out (probably because of user intervention)
}

// <reference path="interact.ts"/>

export type Beaker = Matter.Body & {_substances: Set<ChemComponent>, _tracked: Set<Matter.Body>, addTracked: (body: Matter.Body) => void, equilibriumAssigner?: EquilibriumAssigner};

/**
 * The real interior width of the beaker = w - thick/2 - thick/2
 * = w - thick = 230
 * Interior height = h - thick
 * @param x x-position
 * @param y y-position
 * @param w exterior width
 * @param h exterior height
 * @param thick thickness of the beaker
 * @returns 
 */
export function makeBeaker(x = 250, y = 250, w = 270, h = 350, thick = 40): Beaker {
    let beakerLeft = Matter.Bodies.rectangle(x, y, thick, h) as PhysicsHook;
    let beakerRight = Matter.Bodies.rectangle(x + w, y, thick, h) as PhysicsHook;
    // let rect1 = Bodies.rectangle(300, 300, 200, 40, { ignoreGravity: true } as any) as PhysicsHook;
    let beakerFloor = Matter.Bodies.rectangle(x + w / 2, y + h / 2 - thick / 2, w - thick + 10, thick) as PhysicsHook; // small overlap of 5 to ensure there isn't a gap
    /*
    let beakerCover = Bodies.rectangle(x + w/2, y, w, h) as PhysicsHook;
    // beakerCover.collisionFilter = CollisionFilters.BACKGROUND_GAS;
    beakerCover.render.opacity = 0.1;
    beakerCover.render.fillStyle = '0xFFFFFF';*/
    // beakerLeft.collisionFilter = beakerRight.collisionFilter = beakerFloor.collisionFilter = CollisionFilters.BEAKER;

    beakerLeft.render.fillStyle = beakerRight.render.fillStyle = beakerFloor.render.fillStyle = '#F0F8FF';

    beakerLeft.render.opacity = beakerRight.render.opacity = beakerFloor.render.opacity = 0.9;
    var bod = Matter.Body.create({
        parts: [beakerLeft, beakerRight, beakerFloor], // , beakerCover],
        label: "Beaker"
    });
    for(let b of bod.parts) {
        b.render.lineWidth = 5;
        b.render.strokeStyle = 'black';
        // TODO: make a more refined render of beakers
    }
    bod.collisionFilter = CollisionFilters.BEAKER;

    bod.inertia = Infinity;
    bod.inverseInertia = 0;


    let beaker = bod as Beaker;

    beaker._tracked = new Set();
    beaker._substances = new Set();
    beaker.addTracked = function (body: Matter.Body) {
        if('substs' in body) {
            // we're dealing with a substance
            beaker._substances.add((body as PhysicsHook).substs as ChemComponent);
        }
        this._tracked.add(body);
    };
    beaker.equilibriumAssigner = undefined;
    universe.beakers.push(beaker);


    return beaker;
}
