/// <reference path='matter.min.js'/>
// const universe = {};
__ = function() {
    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

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
    var ground = Bodies.rectangle(500, 610, 1000, 60, { isStatic: true }); ground.label = 'ground';
    var lwall = Bodies.rectangle(0, 0, 60, 1500, {isStatic:true}); lwall.label = 'lwall';
    var rwall = Bodies.rectangle(canva.width, 0, 60, 2000, { isStatic: true }); rwall.label = 'rwall';
    var ceil = Bodies.rectangle(500, 0, 1000, 60, { isStatic: true }); ceil.label = 'ceil';
    ground.collisionFilter = lwall.collisionFilter = rwall.collisionFilter = ceil.collisionFilter = CollisionFilters.WALL;
    // add all of the bodies to the world
    Composite.add(engine.world, [/*boxA, boxB, */ground, lwall, rwall, ceil]);

    // create a renderer
    var render = Render.create({
        // element: document.body,
        canvas: canva,

        engine: engine,
        options: {
            width: canva.width,
            height: canva.height,
            background: 'transparent',
            wireframes: false,
            showAngleIndicator: false
        }
    });
    // run the renderer
    // Render.run(render);

    var mouse = Matter.Mouse.create(canva);
    // TODO mouse.pixelRatio
    // create runner
    var runner = Runner.create();

        var mouseConstraint = Matter.MouseConstraint.create(engine, { //Create Constraint
        canvas: canva,
        mouse: mouse,
        constraint: {
            render: {
                visible: false
            },
            stiffness: 0.8
        } ,
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
    // Render.setPixelRatio(render, 'auto');
    Runner.run(runner, engine);

}();