/// <reference path='first.ts'/>
/// <reference types='../node_modules/@types/matter-js'/>


namespace MatterObjects {
    export let idMap = new Map<string, Matter.Body>() as Map<string, Matter.Body> & {addAll: (bodies: Matter.Body[]) => void};
    idMap.addAll = function (bodies: Matter.Body[]) {
        for(let body of bodies) {
            idMap.set(body.label, body);
        }
    }
    // module aliases

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    // custom modification that checks
    (Engine as any)._bodiesApplyGravity = function (bodies: PhysicsHook[], gravity: Matter.Gravity) {
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

    var canva = document.getElementById('canvas') as HTMLCanvasElement;
    canva.width = 1000;
    canva.height = 600;

    /**
     * 
     * @param x top-left corner
     * @param y top-left corner
     * @param w 
     * @param h 
     * @param thick 
     * @returns 
     */
    function makeWalls(x = 0, y = 0, w = 1000, h = 600, thick = 200) {
        let left  = Bodies.rectangle(x    , y+h/2, thick, h    , { label: 'ground' }) as PhysicsHook;
        let right = Bodies.rectangle(x+w  , y+h/2, thick, h    , { label: 'lwall' }) as PhysicsHook;
        let floor = Bodies.rectangle(x+w/2, y+h  , w    , thick, { label: 'rwall' }) as PhysicsHook; // small overlap of 5 to ensure there isn't a gap
        let ceil  = Bodies.rectangle(x+w/2, y    , w    , thick, { label: 'ceil' }) as PhysicsHook;
        floor.collisionFilter = left.collisionFilter = right.collisionFilter = ceil.collisionFilter = CollisionFilters.WALL;
        floor.zIndex = left.zIndex = right.zIndex = ceil.zIndex = -999;
        floor.mass = left.mass = right.mass = ceil.mass = Infinity;
        floor.isStatic = left.isStatic = right.isStatic = ceil.isStatic = true;
        floor.render.fillStyle = left.render.fillStyle = right.render.fillStyle = ceil.render.fillStyle = '#000';
        return [left, right, floor, ceil];
    }

    // create two boxes and a ground
    // var boxA = Bodies.rectangle(400, 200, 80, 80);
    // var boxB = Bodies.rectangle(450, 50, 80, 80);

    // var ground = Bodies.rectangle(500, 610, 1000, 60, { isStatic: true, label: 'ground' }) as PhysicsHook;
    // var lwall = Bodies.rectangle(0, 0, 60, 1500, { isStatic: true, label: 'lwall' }) as PhysicsHook;
    // var rwall = Bodies.rectangle(canva.width, 0, 60, 2000, { isStatic: true, label: 'rwall' }) as PhysicsHook;
    // var ceil = Bodies.rectangle(500, 0, 1000, 60, { isStatic: true, label: 'ceil'}) as PhysicsHook;
    
    // ground.collisionFilter = lwall.collisionFilter = rwall.collisionFilter = ceil.collisionFilter = CollisionFilters.WALL;
    // ground.zIndex = lwall.zIndex = rwall.zIndex = ceil.zIndex = -999;
    // ground.mass = lwall.mass = rwall.mass = ceil.mass = Infinity;
    let [lwall, rwall, ground, ceil] = makeWalls(-90, -90, 1000 + 90 * 2, 600 + 90 * 2, 200);
    // add all of the bodies to the world
    idMap.addAll([ground, lwall, rwall, ceil]);
    Composite.add(engine.world, [ground, lwall, rwall, ceil]);




    
    let beaker = makeBeaker() as Beaker;


    // beaker.ignoreGravity = true;
    Composite.add(engine.world, [beaker]);


    


    var mouse = Matter.Mouse.create(canva);
    // TODO mouse.pixelRatio
    // create runner
    var runner = Runner.create();
    universe.runner = runner;

    export var mouseConstraint = Matter.MouseConstraint.create(engine, { //Create Constraint
        // @ts-ignore
        canvas: canva,
        mouse: mouse,
        constraint: {
            render: {
                visible: false
            },
            stiffness: 0.8
        } as Matter.Constraint,
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



    Matter.Events.on(MatterObjects.mouseConstraint, 'enddrag', (released) => {
        // max speed limit
        let maxSpeed = 50;
        let Body = Matter.Body;
        let body = released.body as Matter.Body;
        if (!body) return;
        // console.log(body);

        if (body.velocity.x > maxSpeed) {
            Body.setVelocity(body, { x: maxSpeed, y: body.velocity.y });
        }
        if (body.velocity.x < -maxSpeed) {
            Body.setVelocity(body, { x: -maxSpeed, y: body.velocity.y });
        }
        if (body.velocity.y > maxSpeed) {
            Body.setVelocity(body, { x: body.velocity.x, y: maxSpeed });
        }
        if (body.velocity.y < -maxSpeed) {
            Body.setVelocity(body, { x: -body.velocity.x, y: -maxSpeed });
        }
        // Matter.Body.setVelocity(released.body.velocity.x = Math.min(released.body.velocity.x, 10);
        setTimeout(() => {
            // after 5 seconds, check that we're still in world
            // we can also cheaply check if we're in a beaker and then cheaply update the beaker
            if (!isBodyInWorld(body)) {
                // teleport it back to 0, 0
                Matter.Body.setPosition(body, { x: 100, y: 100 });
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
            }

            for(let beaker of universe.beakers) {
                if (Beaker.isBodyInBeaker(body, beaker)) {
                    beaker.addTracked(body);
                    // console.log('tracked!');
                }
            }


        }, 2000); // after 2 seconds
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
}