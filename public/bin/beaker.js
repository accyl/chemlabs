"use strict";
var internal;
(function (internal) {
    function createTempViewportBoundIfNotAlready() {
        if (internal.tempViewportBound === undefined) {
            let vertices = [];
            var canvas = document.getElementById('canvas');
            let tolerance = 80;
            vertices.push(Matter.Vector.create(0 - tolerance, 0 - tolerance));
            let othercorner = [canvas.width, canvas.height];
            vertices.push(Matter.Vector.create(othercorner[0] + tolerance, 0 - tolerance));
            vertices.push(Matter.Vector.create(othercorner[0] + tolerance, othercorner[1] + tolerance));
            vertices.push(Matter.Vector.create(0 - tolerance, othercorner[1] + tolerance));
            internal.tempViewportBound = Matter.Bounds.create(Matter.Vertices.create(vertices, undefined));
            return;
            let bottomleft = Object.assign({}, MatterObjects.idMap.get('lwall').bounds.min);
            let topright = Object.assign({}, MatterObjects.idMap.get('rwall').bounds.max);
            let tol = 10; // tolerance
            bottomleft.x -= tol;
            bottomleft.y -= tol;
            topright.x += tol;
            topright.y += tol;
            // let size = [topright.x - bottomleft.x + tol*2, topright.y - bottomleft.y + tol*2];
            // internal.tempViewportBody = Matter.Bodies.fromVertices(0, 0, [[bottomleft], [topright]], { isStatic: true });
        }
    }
    internal.createTempViewportBoundIfNotAlready = createTempViewportBoundIfNotAlready;
})(internal || (internal = {}));
var Beaker;
(function (Beaker) {
    /**
     * O(n)
     * @param bodies
     * @param beaker
     * @returns
     */
    function allBodiesWithinBeaker(beaker, bodies) {
        // return bodies.every(body => Matter.Query.point(beaker, body.position));
        if (bodies === undefined)
            bodies = Matter.Composite.allBodies(universe.world);
        return bodies.filter(body => isBodyInBeaker(body, beaker));
    }
    Beaker.allBodiesWithinBeaker = allBodiesWithinBeaker;
    function isBodyInBeaker(body, beaker) {
        return Matter.Bounds.contains(beaker.bounds, body.position)
            && Matter.Vertices.contains(beaker.vertices, body.position);
    }
    Beaker.isBodyInBeaker = isBodyInBeaker;
})(Beaker || (Beaker = {}));
function isBodyInWorld(body) {
    internal.createTempViewportBoundIfNotAlready();
    return Matter.Bounds.contains(internal.tempViewportBound, body.position);
}
function allBodiesWithinViewport(bodies, inside = true) {
    if (bodies === undefined)
        bodies = Matter.Composite.allBodies(universe.world);
    internal.createTempViewportBoundIfNotAlready();
    if (inside)
        return bodies.filter(body => Matter.Bounds.contains(internal.tempViewportBound, body.position));
    else
        return bodies.filter(body => !Matter.Bounds.contains(internal.tempViewportBound, body.position));
    // all bodies outside viewport - AKA, they teleported out (probably because of user intervention)
}
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
function makeBeaker(x = 250, y = 250, w = 270, h = 350, thick = 40) {
    let beakerLeft = Matter.Bodies.rectangle(x, y, thick, h);
    let beakerRight = Matter.Bodies.rectangle(x + w, y, thick, h);
    // let rect1 = Bodies.rectangle(300, 300, 200, 40, { ignoreGravity: true } as any) as PhysicsHook;
    let beakerFloor = Matter.Bodies.rectangle(x + w / 2, y + h / 2 - thick / 2, w - thick + 10, thick); // small overlap of 5 to ensure there isn't a gap
    /*
    let beakerCover = Bodies.rectangle(x + w/2, y, w, h) as PhysicsHook;
    // beakerCover.collisionFilter = CollisionFilters.BACKGROUND_GAS;
    beakerCover.render.opacity = 0.1;
    beakerCover.render.fillStyle = '0xFFFFFF';*/
    // beakerLeft.collisionFilter = beakerRight.collisionFilter = beakerFloor.collisionFilter = CollisionFilters.BEAKER;
    beakerLeft.render.fillStyle = beakerRight.render.fillStyle = beakerFloor.render.fillStyle = '#F0F8FF';
    beakerLeft.render.opacity = beakerRight.render.opacity = beakerFloor.render.opacity = 0.9;
    var bod = Matter.Body.create({
        parts: [beakerLeft, beakerRight, beakerFloor],
        label: "Beaker"
    });
    bod.render.lineWidth = 5;
    bod.render.strokeStyle = 'black';
    bod.collisionFilter = CollisionFilters.BEAKER;
    bod.inertia = Infinity;
    bod.inverseInertia = 0;
    let beaker = bod;
    beaker._tracked = new Set();
    beaker.addTracked = function (body) {
        this._tracked.add(body);
    };
    universe.beakers.push(beaker);
    return beaker;
}
