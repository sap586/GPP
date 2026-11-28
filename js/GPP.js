import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

////////////////////////////////////////////////////////
// SCENE
////////////////////////////////////////////////////////

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);

////////////////////////////////////////////////////////
// CAMERA
////////////////////////////////////////////////////////

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 70, 0.01);

let productionRadius = 35;

const PRODUCTION_MIN_RADIUS = 20;
const PRODUCTION_MAX_RADIUS = 160;

let productionYaw = 0;
let productionPitch = 0.35;

let mouseDown = false;

////////////////////////////////////////////////////////
// RENDERER
////////////////////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(renderer.domElement);
const clock = new THREE.Clock();

////////////////////////////////////////////////////////
// LIGHTING
////////////////////////////////////////////////////////

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        2
    )
);

const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    30,
    50,
    30
);

scene.add(sun);

////////////////////////////////////////////////////////
// FLOOR
////////////////////////////////////////////////////////

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(
        40,
        50
    ),
    new THREE.MeshStandardMaterial({
        color:0x303030
    })
);

floor.rotation.x = -Math.PI / 2;

scene.add(floor);

////////////////////////////////////////////////////////
// FEEDER BOTTOM
////////////////////////////////////////////////////////

const feederBottom = new THREE.Mesh(
    new THREE.BoxGeometry(
        40,
        1,
        10
    ),
    new THREE.MeshStandardMaterial({
        color:0x0066ff
    })
);

feederBottom.position.set(
    0,
    0.5,
    -20
);

scene.add(feederBottom);

////////////////////////////////////////////////////////
// FEEDER TOP
////////////////////////////////////////////////////////

const feederTop = feederBottom.clone();

feederTop.position.z = 20;

scene.add(feederTop);

////////////////////////////////////////////////////////
// PCB AREA
////////////////////////////////////////////////////////

const pcbArea = new THREE.Mesh(
    new THREE.BoxGeometry(
        35,
        1,
        18
    ),
    new THREE.MeshStandardMaterial({
        color:0x00aa55
    })
);

pcbArea.position.set(
    0,
    1.5,
    0
);

const BOARD_ENTRY_X = -40;
const BOARD_CENTER_X = 0;
const BOARD_EXIT_X = 40;
const BOARD_CONVEYOR_SPEED = 8;
const BOARD_LIFT_SPEED = 2;
const BOARD_BOTTOM_LOCAL_Y = 1;
const LIFT_PLATFORM_DOWN_Y = 0;
const LIFT_PLATFORM_UP_Y = 1.75;
const LIFT_PLATFORM_HEIGHT = 0.5;

const boardGroup = new THREE.Group();
boardGroup.position.set(BOARD_ENTRY_X, 0, 0);
boardGroup.add(pcbArea);
scene.add(boardGroup);

////////////////////////////////////////////////////////
// GANTRY RAILS
////////////////////////////////////////////////////////

const railMaterial =
new THREE.MeshStandardMaterial({
    color:0xbbbbbb
});

const rail1 = new THREE.Mesh(
    new THREE.BoxGeometry(
        45,
        1,
        1
    ),
    railMaterial
);

rail1.position.set(
    0,
    0,
    -8
);

scene.add(rail1);

const rail2 = rail1.clone();

rail2.position.z = 8;

scene.add(rail2);

////////////////////////////////////////////////////////
// CONVEYOR BELTS AND LIFT
////////////////////////////////////////////////////////

const RAIL_LENGTH = 45;
const BELT_RADIUS = 0.45;
const BELT_CENTER_Y = 0.55;
const BELT_WIDTH = 1.2;
const BELT_SEGMENT_COUNT = 96;
const beltEndX = RAIL_LENGTH / 2 - BELT_RADIUS;
const beltStraightLength = beltEndX * 2;
const beltLoopLength =
    beltStraightLength * 2 +
    Math.PI * 2 * BELT_RADIUS;
const beltSegmentPitch =
    beltLoopLength / BELT_SEGMENT_COUNT;

const beltTreads = [];
const conveyorRollers = [];

const beltTreadGeometry = new THREE.BoxGeometry(
    beltSegmentPitch * 0.9,
    0.12,
    BELT_WIDTH
);

const beltTreadMaterials = [
    new THREE.MeshStandardMaterial({
        color:0x252525,
        roughness:0.85
    }),
    new THREE.MeshStandardMaterial({
        color:0x383838,
        roughness:0.85
    })
];

function getBeltPoint(distance)
{
    let remaining =
        ((distance % beltLoopLength) + beltLoopLength) %
        beltLoopLength;

    if(remaining < beltStraightLength)
    {
        return {
            x: -beltEndX + remaining,
            y: BELT_CENTER_Y + BELT_RADIUS,
            angle: 0
        };
    }

    remaining -= beltStraightLength;

    const arcLength = Math.PI * BELT_RADIUS;

    if(remaining < arcLength)
    {
        const angle =
            Math.PI / 2 -
            remaining / BELT_RADIUS;

        return {
            x: beltEndX + BELT_RADIUS * Math.cos(angle),
            y: BELT_CENTER_Y + BELT_RADIUS * Math.sin(angle),
            angle: angle - Math.PI / 2
        };
    }

    remaining -= arcLength;

    if(remaining < beltStraightLength)
    {
        return {
            x: beltEndX - remaining,
            y: BELT_CENTER_Y - BELT_RADIUS,
            angle: Math.PI
        };
    }

    remaining -= beltStraightLength;

    const angle =
        -Math.PI / 2 -
        remaining / BELT_RADIUS;

    return {
        x: -beltEndX + BELT_RADIUS * Math.cos(angle),
        y: BELT_CENTER_Y + BELT_RADIUS * Math.sin(angle),
        angle: angle - Math.PI / 2
    };
}

for(const beltZ of [-8, 8])
{
    for(let i = 0; i < BELT_SEGMENT_COUNT; i++)
    {
        const tread = new THREE.Mesh(
            beltTreadGeometry,
            beltTreadMaterials[i % beltTreadMaterials.length]
        );

        const distance = i * beltSegmentPitch;
        const point = getBeltPoint(distance);

        tread.position.set(
            point.x,
            point.y,
            beltZ
        );
        tread.rotation.z = point.angle;

        scene.add(tread);
        beltTreads.push({
            mesh: tread,
            distance,
            z: beltZ
        });
    }

    for(const rollerX of [-beltEndX, beltEndX])
    {
        const roller = new THREE.Group();
        roller.position.set(
            rollerX,
            BELT_CENTER_Y,
            beltZ
        );

        const drum = new THREE.Mesh(
            new THREE.CylinderGeometry(
                BELT_RADIUS,
                BELT_RADIUS,
                BELT_WIDTH,
                24
            ),
            new THREE.MeshStandardMaterial({
                color:0x777777,
                metalness:0.55,
                roughness:0.4
            })
        );

        drum.rotation.x = Math.PI / 2;
        roller.add(drum);

        for(const bearingSide of [-1, 1])
        {
            const bearing = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.17,
                    0.17,
                    0.14,
                    16
                ),
                new THREE.MeshStandardMaterial({
                    color:0xb0b0b0,
                    metalness:0.65,
                    roughness:0.35
                })
            );

            bearing.rotation.x = Math.PI / 2;
            bearing.position.z =
                bearingSide * (BELT_WIDTH / 2 + 0.07);
            roller.add(bearing);
        }

        scene.add(roller);
        conveyorRollers.push(roller);
    }
}

const liftPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(
        22,
        LIFT_PLATFORM_HEIGHT,
        14
    ),
    new THREE.MeshStandardMaterial({
        color:0x777777,
        metalness:0.45,
        roughness:0.5
    })
);

liftPlatform.position.set(
    0,
    LIFT_PLATFORM_DOWN_Y,
    0
);

scene.add(liftPlatform);

const lockClamps = [];
const clampOpenY = 3.8;
const clampLockedY = 3.2;

for(const clampX of [-15, 15])
{
    for(const clampZ of [-7.5, 7.5])
    {
        const clamp = new THREE.Mesh(
            new THREE.BoxGeometry(
                2,
                0.4,
                1.5
            ),
            new THREE.MeshStandardMaterial({
                color:0xaaaaaa,
                metalness:0.5,
                roughness:0.4
            })
        );

        clamp.position.set(
            clampX,
            clampOpenY,
            clampZ
        );
        clamp.visible = false;

        scene.add(clamp);
        lockClamps.push(clamp);
    }
}

////////////////////////////////////////////////////////
// GANTRY
////////////////////////////////////////////////////////

const gantry = new THREE.Group();

const beam = new THREE.Mesh(
    new THREE.BoxGeometry(
        2,
        2,
        18
    ),
    new THREE.MeshStandardMaterial({
        color:0xff8800
    })
);

beam.rotation.set(
    THREE.MathUtils.degToRad(0), // X
    THREE.MathUtils.degToRad(90), // Y
    THREE.MathUtils.degToRad(0)  // Z
);

gantry.add(beam);

////////////////////////////////////////////////////////
// HEAD
////////////////////////////////////////////////////////

const head = new THREE.Mesh(
    new THREE.BoxGeometry(
        2,
        2,
        2
    ),
    new THREE.MeshStandardMaterial({
        color:0xff3333
    })
);

head.position.y = -2;

gantry.add(head);

////////////////////////////////////////////////////////
// NOZZLE
////////////////////////////////////////////////////////

const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(
        0.4,
        0.4,
        4
    ),
    new THREE.MeshStandardMaterial({
        color:0xffff00
    })
);

nozzle.position.y = -5;

gantry.add(nozzle);

gantry.position.y = 12;

scene.add(gantry);

////////////////////////////////////////////////////////
// PART
////////////////////////////////////////////////////////

function createPart(color = 0xffffff, parent = scene)
{
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            1,
            1,
            1
        ),
        new THREE.MeshStandardMaterial({
            color
        })
    );

    parent.add(mesh);

    return mesh;
}

let movingPart = createPart();

////////////////////////////////////////////////////////
// PLACEMENTS
////////////////////////////////////////////////////////

const placements = [
    [-10,-3],
    [-8,-3],
    [-3,-3],
    [0,0],
    [3,0],
    [8,0],
    [10,0]
];

let placementIndex = 0;
let carried = false;

const placedParts = [];

////////////////////////////////////////////////////////
// MACHINE STATE
////////////////////////////////////////////////////////

let machineRunning = false;
let state = "moveToPick";
let boardAction = "outside";

////////////////////////////////////////////////////////
// CAMERA STATE
////////////////////////////////////////////////////////

let viewMode = "top";
let topAngle = 0;
let targetTopAngle = 0;
let productionViewIndex = 0;
const productionViews =
[
    { x:  0, y:18, z:-35 },
    { x: 15, y:18, z:-35 },
    { x: 30, y:18, z:-35 },
    { x:-15, y:18, z:-35 },
    { x:-30, y:18, z:-35 }
];

const productionAngleStep = Math.PI / 4;
	
	

////////////////////////////////////////////////////////
// UI FUNCTIONS
////////////////////////////////////////////////////////

window.boardIn = () =>
{
    if(boardAction !== "outside" || machineRunning)
    {
        console.warn("Board In is only available when the board is outside.");
        return;
    }

    boardGroup.position.set(
        BOARD_ENTRY_X,
        0,
        0
    );
    liftPlatform.position.y = LIFT_PLATFORM_DOWN_Y;

    for(const clamp of lockClamps)
    {
        clamp.position.y = clampOpenY;
        clamp.visible = false;
    }

    placementIndex = 0;
    carried = false;
    state = "moveToPick";
    boardAction = "movingIn";
};

window.boardOut = () =>
{
    if(boardAction !== "ready")
    {
        console.warn("Board Out is only available after the board is locked in place.");
        return;
    }

    if(machineRunning || carried || state !== "moveToPick")
    {
        console.warn("Stop or finish the placement cycle before moving the board out.");
        return;
    }

    boardAction = "unlocking";
};

window.startMachine = () =>
{
    if(boardAction !== "ready")
    {
        console.warn("Move the board in and lock it before starting the machine.");
        return;
    }

    if(placementIndex >= placements.length)
    {
        console.warn("All placement positions on this board are complete.");
        return;
    }

    machineRunning = true;
};

window.stopMachine = () =>
{
    machineRunning = false;
};

window.setTopView = () =>
{
	console.log("setTopView - current view : " + viewMode);
	if (viewMode == "top")
	{
		targetTopAngle += Math.PI;
	}
    viewMode = "top";
};

window.setProductionView = () =>
{
	console.log("setProductionView - current view : " + viewMode);
	if (viewMode == "production")
	{
		productionViewIndex++;

        if(productionViewIndex >= 4)
        {
            productionViewIndex = 0;
        }
	}
    viewMode = "production";
};

////////////////////////////////////////////////////////
// MACHINE CYCLE
////////////////////////////////////////////////////////

function machineCycle()
{
    // stop if all placements are done
    if (placementIndex >= placements.length) {
        machineRunning = false;
        return;
    }
    const pickX = 0;
    const pickZ = -20;

    const target = placements[placementIndex];

    const placeX = target[0];
    const placeZ = target[1];

    ////////////////////////////////////////////////////
    // MOVE TO PICK
    ////////////////////////////////////////////////////

    if(state === "moveToPick")
    {
        gantry.position.x +=
            (pickX - gantry.position.x) * 0.05;

        gantry.position.z +=
            (pickZ - gantry.position.z) * 0.05;

        if(
            Math.abs(gantry.position.x - pickX) < 0.2 &&
            Math.abs(gantry.position.z - pickZ) < 0.2
        )
        {
            state = "pick";
        }
    }

    ////////////////////////////////////////////////////
    // PICK
    ////////////////////////////////////////////////////

    else if(state === "pick")
    {
        nozzle.scale.y +=
            (2 - nozzle.scale.y) * 0.1;

        if(nozzle.scale.y > 1.95)
        {
            carried = true;
            state = "moveToPlace";
        }
    }

    ////////////////////////////////////////////////////
    // MOVE TO PLACE
    ////////////////////////////////////////////////////

    else if(state === "moveToPlace")
    {
        nozzle.scale.y +=
            (1 - nozzle.scale.y) * 0.1;

        gantry.position.x +=
            (placeX - gantry.position.x) * 0.05;

        gantry.position.z +=
            (placeZ - gantry.position.z) * 0.05;

        if(
            Math.abs(gantry.position.x - placeX) < 0.2 &&
            Math.abs(gantry.position.z - placeZ) < 0.2
        )
        {
            state = "place";
        }
    }

    ////////////////////////////////////////////////////
    // PLACE
    ////////////////////////////////////////////////////

    else if(state === "place")
    {
        nozzle.scale.y +=
            (2 - nozzle.scale.y) * 0.1;

        if(nozzle.scale.y > 1.95)
        {
            const placed =
                createPart(
                    0x00ffff,
                    boardGroup
                );

            placed.position.set(
                placeX,
                2.5,
                placeZ
            );

            placedParts.push(
                placed
            );

            if(
                placedParts.length > 50
            )
            {
                const oldestPart = placedParts.shift();
                boardGroup.remove(oldestPart);
                oldestPart.geometry.dispose();
                oldestPart.material.dispose();
            }

            scene.remove(
                movingPart
            );

            movingPart =
                createPart();

            carried = false;

            placementIndex++;

            state = "moveToPick";

            // stop if all placements are done
            if (placementIndex >= placements.length) {
                machineRunning = false;
            }
        }
    }

    ////////////////////////////////////////////////////
    // PART FOLLOWS HEAD
    ////////////////////////////////////////////////////

    if(carried)
    {
        movingPart.position.set(
            gantry.position.x,
            6,
            gantry.position.z
        );
    }
    else
    {
        movingPart.position.set(
            0,
            2,
            -20
        );
    }
}

function updateConveyorBelts(deltaTime, direction)
{
    const beltDistance =
        direction *
        BOARD_CONVEYOR_SPEED *
        deltaTime;

    for(const tread of beltTreads)
    {
        tread.distance =
            ((tread.distance + beltDistance) % beltLoopLength +
            beltLoopLength) %
            beltLoopLength;

        const point = getBeltPoint(tread.distance);

        tread.mesh.position.set(
            point.x,
            point.y,
            tread.z
        );
        tread.mesh.rotation.z = point.angle;
    }

    const rollerRotation =
        -direction *
        BOARD_CONVEYOR_SPEED /
        BELT_RADIUS *
        deltaTime;

    for(const roller of conveyorRollers)
    {
        roller.rotation.z += rollerRotation;
    }
}

function updateLift(deltaTime, direction)
{
    liftPlatform.position.y = THREE.MathUtils.clamp(
        liftPlatform.position.y +
            direction * BOARD_LIFT_SPEED * deltaTime,
        LIFT_PLATFORM_DOWN_Y,
        LIFT_PLATFORM_UP_Y
    );

    boardGroup.position.y = Math.max(
        0,
        liftPlatform.position.y +
            LIFT_PLATFORM_HEIGHT / 2 -
            BOARD_BOTTOM_LOCAL_Y
    );
}

function clearPlacedParts()
{
    while(placedParts.length > 0)
    {
        const part = placedParts.pop();
        boardGroup.remove(part);
        part.geometry.dispose();
        part.material.dispose();
    }
}

function updateBoardTransport(deltaTime)
{
    if(boardAction === "movingIn")
    {
        updateConveyorBelts(deltaTime, 1);

        boardGroup.position.x = Math.min(
            BOARD_CENTER_X,
            boardGroup.position.x +
                BOARD_CONVEYOR_SPEED * deltaTime
        );

        if(boardGroup.position.x >= BOARD_CENTER_X)
        {
            boardGroup.position.x = BOARD_CENTER_X;
            boardAction = "lifting";
        }
    }
    else if(boardAction === "lifting")
    {
        updateLift(deltaTime, 1);

        if(liftPlatform.position.y >= LIFT_PLATFORM_UP_Y)
        {
            liftPlatform.position.y = LIFT_PLATFORM_UP_Y;
            boardGroup.position.y =
                LIFT_PLATFORM_UP_Y +
                LIFT_PLATFORM_HEIGHT / 2 -
                BOARD_BOTTOM_LOCAL_Y;

            for(const clamp of lockClamps)
            {
                clamp.visible = true;
            }

            boardAction = "locking";
        }
    }
    else if(boardAction === "locking")
    {
        let allClampsLocked = true;

        for(const clamp of lockClamps)
        {
            clamp.position.y = Math.max(
                clampLockedY,
                clamp.position.y - BOARD_LIFT_SPEED * deltaTime
            );

            if(clamp.position.y > clampLockedY)
            {
                allClampsLocked = false;
            }
        }

        if(allClampsLocked)
        {
            boardAction = "ready";
        }
    }
    else if(boardAction === "unlocking")
    {
        let allClampsOpen = true;

        for(const clamp of lockClamps)
        {
            clamp.position.y = Math.min(
                clampOpenY,
                clamp.position.y + BOARD_LIFT_SPEED * deltaTime
            );

            if(clamp.position.y < clampOpenY)
            {
                allClampsOpen = false;
            }
        }

        if(allClampsOpen)
        {
            for(const clamp of lockClamps)
            {
                clamp.visible = false;
            }

            boardAction = "lowering";
        }
    }
    else if(boardAction === "lowering")
    {
        updateLift(deltaTime, -1);

        if(liftPlatform.position.y <= LIFT_PLATFORM_DOWN_Y)
        {
            liftPlatform.position.y = LIFT_PLATFORM_DOWN_Y;
            boardGroup.position.y = 0;
            boardAction = "movingOut";
        }
    }
    else if(boardAction === "movingOut")
    {
        updateConveyorBelts(deltaTime, -1);

        boardGroup.position.x = Math.min(
            BOARD_EXIT_X,
            boardGroup.position.x +
                BOARD_CONVEYOR_SPEED * deltaTime
        );

        if(boardGroup.position.x >= BOARD_EXIT_X)
        {
            boardGroup.position.x = BOARD_EXIT_X;
            clearPlacedParts();
            placementIndex = 0;
            carried = false;
            state = "moveToPick";
            boardAction = "outside";
        }
    }
}

////////////////////////////////////////////////////////
// ANIMATION
////////////////////////////////////////////////////////

function animate()
{
    requestAnimationFrame(
        animate
    );

    const deltaTime = Math.min(
        clock.getDelta(),
        0.05
    );

    updateBoardTransport(deltaTime);

    if(machineRunning)
    {
        machineCycle();
    }

    if(viewMode === "top")
    {
		topAngle += (targetTopAngle - topAngle) * 0.05;
		camera.position.set(0, 70, 0);
		camera.up.set(Math.sin(topAngle), 0, Math.cos(topAngle));
		
		camera.lookAt(0,0,0);
    }
    else
    {
		
		const angle =
			productionViewIndex *
			productionAngleStep;
		
		const radius = productionRadius;

		const targetX =
			Math.sin(angle) * radius;

		const targetZ =
		   -Math.cos(angle) * radius;

		camera.position.x +=
			(targetX - camera.position.x) * 0.05;

		camera.position.y +=
			(18 - camera.position.y) * 0.05;

		camera.position.z +=
			(targetZ - camera.position.z) * 0.05;
		
		/*	
		const targetX =
			Math.cos(productionPitch) *
			Math.sin(productionYaw) *
			productionRadius;

		const targetY =
			Math.sin(productionPitch) *
			productionRadius;

		const targetZ =
			Math.cos(productionPitch) *
			Math.cos(productionYaw) *
			productionRadius;

		camera.position.x +=
			(targetX - camera.position.x) * 0.1;

		camera.position.y +=
			(targetY - camera.position.y) * 0.1;

		camera.position.z +=
			(targetZ - camera.position.z) * 0.1;
        */

		camera.up.set(0, 1, 0);
		camera.lookAt(
			0,
			5,
			0
		);

    }

    const cameraInfo = document.getElementById("cameraInfo");
    const rotation = camera.rotation;
    cameraInfo.innerHTML =
        "pos : (" +
        camera.position.x.toFixed(2) + ", " +
        camera.position.y.toFixed(2) + ", " +
        camera.position.z.toFixed(2) + ")<br>" +
        "rot : (" +
        THREE.MathUtils.radToDeg(rotation.x).toFixed(2) + ", " +
        THREE.MathUtils.radToDeg(rotation.y).toFixed(2) + ", " +
        THREE.MathUtils.radToDeg(rotation.z).toFixed(2) + ")";

    renderer.render(
        scene,
        camera
    );
}

animate();

document.addEventListener("keydown", (event) =>
{
    if(event.key.toLowerCase() === "p")
    {
        setProductionView();
    }
});

////////////////////////////////////////////////////////
// RESIZE
////////////////////////////////////////////////////////

window.addEventListener(
    "resize",
    () =>
    {
        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


window.addEventListener("wheel", (event) =>
{
    if(viewMode !== "production")
    {
        return;
    }

    if(event.deltaY > 0)
    {
        productionRadius += 2;
    }
    else
    {
        productionRadius -= 2;
    }

    productionRadius = Math.max(
        PRODUCTION_MIN_RADIUS,
        Math.min(
            PRODUCTION_MAX_RADIUS,
            productionRadius
        )
    );

    console.log(
        "Production Zoom: " +
        productionRadius
    );
});

window.addEventListener("mousedown", (e) =>
{
    if(viewMode !== "production")
        return;

    if(e.button === 0)
        mouseDown = true;
});

window.addEventListener("mouseup", () =>
{
    mouseDown = false;
});

window.addEventListener("mousemove", (e) =>
{
    if(viewMode !== "production")
        return;

    if(!mouseDown)
        return;

    productionYaw +=
        e.movementX * 0.01;

    productionPitch -=
        e.movementY * 0.01;

    productionPitch =
        Math.max(
            0.1,
            Math.min(
                1.2,
                productionPitch
            )
        );
});
