"use strict";
var internal;
(function (internal) {
})(internal || (internal = {}));
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
    return bodies.filter(body => (Matter.Bounds.contains(beaker.bounds, body.position)
        && Matter.Vertices.contains(beaker.vertices, body.position)));
}
function allBodiesWithinViewport(bodies, inside = true) {
    if (bodies === undefined)
        bodies = Matter.Composite.allBodies(universe.world);
    if (internal.tempViewportBound === undefined) {
        let bottomleft = Object.assign({}, MatterObjects.idMap.get('lwall').bounds.min);
        let topright = Object.assign({}, MatterObjects.idMap.get('rwall').bounds.max);
        let tol = 10; // tolerance
        bottomleft.x -= tol;
        bottomleft.y -= tol;
        topright.x += tol;
        topright.y += tol;
        // let size = [topright.x - bottomleft.x + tol*2, topright.y - bottomleft.y + tol*2];
        // internal.tempViewportBody = Matter.Bodies.fromVertices(0, 0, [[bottomleft], [topright]], { isStatic: true });
        internal.tempViewportBound = Matter.Bounds.create(Matter.Vertices.create([bottomleft, topright], undefined));
    }
    if (inside)
        return bodies.filter(body => Matter.Bounds.contains(internal.tempViewportBound, body.position));
    else
        return bodies.filter(body => !Matter.Bounds.contains(internal.tempViewportBound, body.position));
    // all bodies outside viewport - AKA, they teleported out (probably because of user intervention)
}
// function where we take
// we attach an event handler to the universe.engine.on('beforeUpdate', () => {
// or we attach an event handler to whenever the user's mouse releases a body
// Events.on(mouseconstraint, "enddrag", callback)
// https://brm.io/matter-js/docs/classes/MouseConstraint.html#events
// https://github.com/liabru/matter-js/issues/5
// in query function Wf(), if we find a special character like #.>[] then we switch to querySelectorMode 
// and parse everything within the [] as a Wc query.
// otherwise Wf searches as if it was a Wc query.
