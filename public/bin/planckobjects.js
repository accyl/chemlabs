"use strict";
/// <reference path='first.ts'/>
/// <reference types='../node_modules/planck-js'/>
// <reference path='../node_modules/planck-js/dist/planck-with-testbed.js'/>
// import * as planck from '../node_modules/planck-js/dist/planck-with-testbed.js';
// planck = planck as 
planck.testbed('CompoundShapes', function (testbed) {
    var pl = planck, Vec2 = pl.Vec2;
    var canva = document.getElementById('canvas');
    var world = new pl.World({
        gravity: Vec2(0, -10)
    });
    world.createBody(Vec2(0.0, 0.0)).createFixture(pl.Edge(Vec2(50.0, 0.0), Vec2(-50.0, 0.0)), 0.0);
    // create an engine
    universe.world = world;
    world.createBody(Vec2(0.0, 0.0)).createFixture(pl.Edge(Vec2(50.0, 0.0), Vec2(-50.0, 0.0)), 0.0);
    var circle1 = pl.Circle(Vec2(-0.5, 0.5), 0.5);
    var circle2 = pl.Circle(Vec2(0.5, 0.5), 0.5);
    for (var i = 0; i < 10; ++i) {
        var body = world.createDynamicBody({
            position: Vec2(pl.Math.random(-0.1, 0.1) + 5.0, 1.05 + 2.5 * i),
            angle: pl.Math.random(-Math.PI, Math.PI)
        });
        body.createFixture(circle1, 2.0);
        body.createFixture(circle2, 0.0);
    }
    var polygon1 = pl.Box(0.25, 0.5);
    var polygon2 = pl.Box(0.25, 0.5, Vec2(0.0, -0.5), 0.5 * Math.PI);
    for (var i = 0; i < 10; ++i) {
        var body = world.createDynamicBody({
            position: Vec2(pl.Math.random(-0.1, 0.1) - 5.0, 1.05 + 2.5 * i),
            angle: pl.Math.random(-Math.PI, Math.PI)
        });
        body.createFixture(polygon1, 2.0);
        body.createFixture(polygon2, 2.0);
    }
    var xf1 = pl.Transform();
    xf1.q.set(0.3524 * Math.PI);
    xf1.p = xf1.q.getXAxis();
    var triangle1 = pl.Polygon([Vec2(-1.0, 0.0), Vec2(1.0, 0.0), Vec2(0.0, 0.5)].map(pl.Transform.mulFn(xf1)));
    var xf2 = pl.Transform();
    xf2.q.set(-0.3524 * Math.PI);
    xf2.p = Vec2.neg(xf2.q.getXAxis());
    var triangle2 = pl.Polygon([Vec2(-1.0, 0.0), Vec2(1.0, 0.0), Vec2(0.0, 0.5)].map(pl.Transform.mulFn(xf2)));
    for (var i = 0; i < 10; ++i) {
        var body = world.createDynamicBody({
            position: Vec2(pl.Math.random(-0.1, 0.1), 2.05 + 2.5 * i),
            angle: 0.0
        });
        body.createFixture(triangle1, 2.0);
        body.createFixture(triangle2, 2.0);
    }
    var bottom = pl.Box(1.5, 0.15);
    var left = pl.Box(0.15, 2.7, Vec2(-1.45, 2.35), 0.2);
    var right = pl.Box(0.15, 2.7, Vec2(1.45, 2.35), -0.2);
    var container = world.createBody(Vec2(0.0, 2.0));
    container.createFixture(bottom, 4.0);
    container.createFixture(left, 4.0);
    container.createFixture(right, 4.0);
    // create two boxes and a ground
    // var boxA = Bodies.rectangle(400, 200, 80, 80);
    // var boxB = Bodies.rectangle(450, 50, 80, 80);
    // var ground = Bodies.rectangle(500, 610, 1000, 60, { isStatic: true }) as PhysicsHook;
    // ground.label = 'ground'; ground.zIndex = -999; 
    // var lwall = Bodies.rectangle(0, 0, 60, 1500, { isStatic: true }) as PhysicsHook;
    // lwall.label = 'lwall'; lwall.zIndex = -999;
    // var rwall = Bodies.rectangle(canva.width, 0, 60, 2000, { isStatic: true }) as PhysicsHook;
    // rwall.label = 'rwall'; rwall.zIndex = -999;
    // var ceil = Bodies.rectangle(500, 0, 1000, 60, { isStatic: true }) as PhysicsHook;
    // ceil.label = 'ceil'; ceil.zIndex = -999;
    // ground.collisionFilter = lwall.collisionFilter = rwall.collisionFilter = ceil.collisionFilter = CollisionFilters.WALL;
    // add all of the bodies to the world
    idMap.addAll([ground, lwall, rwall, ceil]);
    Composite.add(engine.world, [/*boxA, boxB, */ ground, lwall, rwall, ceil]);
    /**
     * The real interior width of the beaker = 300 - 40/2 - 40/2 = 260
     * @param x x-position
     * @param y y-position
     * @param w exterior width
     * @param h exterior height
     * @param thick thickness of the beaker
     * @returns
     */
    function makeBeaker(x = 250, y = 250, w = 270, h = 350, thick = 40) {
        let beakerLeft = Bodies.rectangle(x, y, thick, h);
        let beakerRight = Bodies.rectangle(x + w, y, thick, h);
        // let rect1 = Bodies.rectangle(300, 300, 200, 40, { ignoreGravity: true } as any) as PhysicsHook;
        let beakerFloor = Bodies.rectangle(x + w / 2, y + h / 2 - thick / 2, w - thick + 10, thick); // small overlap of 5 to ensure there isn't a gap
        /*
        let beakerCover = Bodies.rectangle(x + w/2, y, w, h) as PhysicsHook;
        // beakerCover.collisionFilter = CollisionFilters.BACKGROUND_GAS;
        beakerCover.render.opacity = 0.1;
        beakerCover.render.fillStyle = '0xFFFFFF';*/
        // beakerLeft.collisionFilter = beakerRight.collisionFilter = beakerFloor.collisionFilter = CollisionFilters.BEAKER;
        beakerLeft.render.fillStyle = beakerRight.render.fillStyle = beakerFloor.render.fillStyle = '#F0F8FF';
        beakerLeft.render.opacity = beakerRight.render.opacity = beakerFloor.render.opacity = 0.9;
        var beaker = Matter.Body.create({
            parts: [beakerLeft, beakerRight, beakerFloor],
            label: "Beaker"
        });
        beaker.render.lineWidth = 5;
        beaker.render.strokeStyle = 'black';
        beaker.collisionFilter = CollisionFilters.BEAKER;
        return beaker;
    }
    let beaker = makeBeaker();
    beaker.inertia = Infinity;
    beaker.inverseInertia = 0;
    // beaker.ignoreGravity = true;
    Composite.add(engine.world, [beaker]);
    var mouse = Matter.Mouse.create(canva);
    // TODO mouse.pixelRatio
    // create runner
    var runner = Runner.create();
    MJuniverse.runner = runner;
    var mouseConstraint = Matter.MouseConstraint.create(engine, {
        // @ts-ignore
        canvas: canva,
        mouse: mouse,
        constraint: {
            render: {
                visible: false
            },
            stiffness: 0.8
        },
        collisionFilter: CollisionFilters.MOUSE
    });
    // https://stackoverflow.com/questions/59321773/prevent-force-dragging-bodies-through-other-bodies-with-matterjs
    // https://github.com/liabru/matter-js/issues/840
    // const limitMaxSpeed = () => {
    //     let maxSpeed = 10;
    //     if (body.velocity.x > maxSpeed) {
    //         Matter.Body.setVelocity(body, { x: maxSpeed, y: body.velocity.y });
    //     }
    //     if (body.velocity.x < -maxSpeed) {
    //         Matter.Body.setVelocity(body, { x: -maxSpeed, y: body.velocity.y });
    //     }
    //     if (body.velocity.y > maxSpeed) {
    //         Matter.Body.setVelocity(body, { x: body.velocity.x, y: maxSpeed });
    //     }
    //     if (body.velocity.y < -maxSpeed) {
    //         Matter.Body.setVelocity(body, { x: -body.velocity.x, y: -maxSpeed });
    //     }
    // }
    // Matter.Events.on(engine, 'beforeUpdate', limitMaxSpeed);
    Matter.World.add(world, mouseConstraint);
    Matter.Events.on(mouseConstraint, "startdrag", (event) => {
        let body = event.body;
        debugBody(body);
    });
    // run the engine
    // run the renderer
    // create a renderer
    var render = Render.create({
        // element: document.body,
        canvas: canva,
        context: getCanvasContext(canva),
        engine: engine,
        options: {
            width: canva.width,
            height: canva.height,
            background: 'transparent',
            wireframes: false,
            showAngleIndicator: false,
            showConvexHulls: true
        }
    });
    Render.run(render);
    // Render.setPixelRatio(render, 'auto' as any);
    Runner.run(runner, engine);
    return world;
    // prettier-ignore
});
