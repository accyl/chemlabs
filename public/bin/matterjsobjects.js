"use strict";
/// <reference path='first.ts'/>
// / <reference path='../public/libs/matter.min.js'/>
var MatterObjects;
(function (MatterObjects) {
    MatterObjects.idMap = new Map();
    MatterObjects.idMap.addAll = function (bodies) {
        for (let body of bodies) {
            MatterObjects.idMap.set(body.label, body);
        }
    };
    // module aliases
    var Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner, Bodies = Matter.Bodies, Composite = Matter.Composite;
    // custom modification that checks
    Engine._bodiesApplyGravity = function (bodies, gravity) {
        var gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;
        if ((gravity.x === 0 && gravity.y === 0) || gravityScale === 0) {
            return;
        }
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            // CHANGE HERE
            if (body.isStatic || body.isSleeping || body.ignoreGravity) // CHANGE HERE
                continue;
            // apply gravity
            body.force.y += body.mass * gravity.y * gravityScale;
            body.force.x += body.mass * gravity.x * gravityScale;
        }
    };
    // create an engine
    var engine = Engine.create();
    var world = engine.world;
    universe.engine = engine;
    universe.world = world;
    var canva = document.getElementById('canvas');
    canva.width = 1000;
    canva.height = 600;
    // create two boxes and a ground
    // var boxA = Bodies.rectangle(400, 200, 80, 80);
    // var boxB = Bodies.rectangle(450, 50, 80, 80);
    var ground = Bodies.rectangle(500, 610, 1000, 60, { isStatic: true });
    ground.label = 'ground';
    ground.zIndex = -999;
    var lwall = Bodies.rectangle(0, 0, 60, 1500, { isStatic: true });
    lwall.label = 'lwall';
    lwall.zIndex = -999;
    var rwall = Bodies.rectangle(canva.width, 0, 60, 2000, { isStatic: true });
    rwall.label = 'rwall';
    rwall.zIndex = -999;
    var ceil = Bodies.rectangle(500, 0, 1000, 60, { isStatic: true });
    ceil.label = 'ceil';
    ceil.zIndex = -999;
    ground.collisionFilter = lwall.collisionFilter = rwall.collisionFilter = ceil.collisionFilter = CollisionFilters.WALL;
    // add all of the bodies to the world
    MatterObjects.idMap.addAll([ground, lwall, rwall, ceil]);
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
    universe.runner = runner;
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
    // prettier-ignore
})(MatterObjects || (MatterObjects = {}));
