import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CameraControls } from './cameraControls.js';

//
// Scene
//
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

//
// Camera
//
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    2000
);

camera.position.set(80, 80, 80);

//
// Renderer
//
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.shadowMap.enabled = true;

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(
    renderer.domElement
);

//
// Controls
//
new CameraControls(
    camera,
    renderer.domElement
);

//
// Lights
//
const ambient = new THREE.AmbientLight(
    0xffffff,
    0.5
);

scene.add(ambient);

const light =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

light.position.set(
    100,
    120,
    80
);

scene.add(light);

//
// Floor
//
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(
        300,
        300
    ),
    new THREE.MeshStandardMaterial({
        color: 0x707070
    })
);

floor.rotation.x =
    -Math.PI / 2;

floor.position.y =
    -24;

scene.add(floor);

//
// Coordinate Arrows
//

const axisLength = 60;

//
// X
//

const xArrow =
    new THREE.ArrowHelper(
        new THREE.Vector3(
            1,0,0
        ),
        new THREE.Vector3(
            0,0,0
        ),
        axisLength,
        0xff0000,
        4,
        2
    );

scene.add(xArrow);

//
// Y
//

const yArrow =
    new THREE.ArrowHelper(
        new THREE.Vector3(
            0,0,1
        ),
        new THREE.Vector3(
            0,0,0
        ),
        axisLength,
        0x00ffff,
        4,
        2
    );

scene.add(yArrow);

//
// Z
//

const zArrow =
    new THREE.ArrowHelper(
        new THREE.Vector3(
            0,1,0
        ),
        new THREE.Vector3(
            0,0,0
        ),
        axisLength,
        0x00ff00,
        4,
        2
    );

scene.add(zArrow);

//
// Coordinate Labels
//

function makeLabel(text,color)
{
    const canvas =
        document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 256;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.font = "180px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        text,
        128,
        128
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    const sprite =
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            })
        );

    sprite.scale.set(
        12,
        12,
        1
    );

    return sprite;
}

//
// X
// Red
//

const xLabel =
    makeLabel(
        "X",
        "#ff0000"
    );

xLabel.position.set(
    72,
     0,
     0
);

scene.add(xLabel);

//
// Y
// Cyan
//

const yLabel =
    makeLabel(
        "Y",
        "#00ffff"
    );

yLabel.position.set(
     0,
     0,
    72
);

scene.add(yLabel);

//
// Z
// Green
//

const zLabel =
    makeLabel(
        "Z",
        "#00ff00"
    );

zLabel.position.set(
     0,
    72,
     0
);

scene.add(zLabel);

//
// Grid
//
scene.add(
    new THREE.GridHelper(
        100,
        20,
        0x4444ff,
        0x444444
    )
);

//
// GRID MARKERS
//

function createGridLabel(text, x, z)
{
    const canvas =
        document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 128;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.font = "56px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        text,
        128,
        64
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    const sprite =
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            })
        );

    sprite.scale.set(
        8,
        4,
        1
    );

    sprite.position.set(
        x,
        -23.5,
        z
    );

    scene.add(sprite);
}

//
// X AXIS MARKERS
//

for(let x=-50;x<=50;x+=10)
{
    createGridLabel(
        x.toString(),
        x,
        -58
    );
}

//
// Y AXIS MARKERS
//

for(let y=-50;y<=50;y+=10)
{
    createGridLabel(
        y.toString(),
        -58,
        y
    );
}

//
// MACHINE ENVELOPE MARKERS
//

createGridLabel(
    "-24",
    -24,
    0
);

createGridLabel(
    "+24",
     24,
     0
);

createGridLabel(
    "-24",
     0,
    -24
);

createGridLabel(
    "+24",
     0,
     24
);

//
// MIN / MAX
//

createGridLabel(
    "X MIN",
    -70,
    -58
);

createGridLabel(
    "X MAX",
     70,
    -58
);

createGridLabel(
    "Y MIN",
    -58,
    -70
);

createGridLabel(
    "Y MAX",
    -58,
     70
);

//
// ORIGIN
//

createGridLabel(
    "(0,0)",
    0,
    0
);

//
// Machine
//

const machine = new THREE.Group();
scene.add(machine);

//
// Materials
//

const frameMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x404040,
        metalness: 0.8,
        roughness: 0.3
    });

const coverMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xd0d0d0,
        metalness: 0.4,
        roughness: 0.5,
        side: THREE.DoubleSide
    });

//
// Hex Corner Points
//

const pts = [

    [-20, 24],
    [ 20, 24],
    [ 32,  0],
    [ 20,-24],
    [-20,-24],
    [-32,  0]

];

//
// Beam Helper
//

function createBeam(
    x1,y1,z1,
    x2,y2,z2,
    size = 2
)
{
    const v1 =
        new THREE.Vector3(
            x1,y1,z1
        );

    const v2 =
        new THREE.Vector3(
            x2,y2,z2
        );

    const dir =
        new THREE.Vector3()
            .subVectors(v2,v1);

    const length =
        dir.length();

    const beam =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size,
                length
            ),
            frameMaterial
        );

    beam.position.copy(
        v1.clone()
          .add(v2)
          .multiplyScalar(0.5)
    );

    beam.quaternion
        .setFromUnitVectors(
            new THREE.Vector3(
                0,0,1
            ),
            dir.normalize()
        );

    machine.add(beam);

    return beam;
}

//
// FRONT HEX FRAME
//

for(let i=0;i<6;i++)
{
    const a = pts[i];
    const b = pts[(i+1)%6];

    createBeam(
        a[0],a[1],24,
        b[0],b[1],24
    );
}

//
// REAR HEX FRAME
//

for(let i=0;i<6;i++)
{
    const a = pts[i];
    const b = pts[(i+1)%6];

    createBeam(
        a[0],a[1],-24,
        b[0],b[1],-24
    );
}

//
// CONNECTING MEMBERS
//

for(let i=0;i<6;i++)
{
    const p = pts[i];

    createBeam(
        p[0],
        p[1],
        24,

        p[0],
        p[1],
        -24
    );
}

//
// COVERS
//

const covers = new THREE.Group();
machine.add(covers);

const panelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xd0d0d0,
        metalness: 0.3,
        roughness: 0.5,
        side: THREE.DoubleSide
    });

//
// FRONT HEX COVER
//

function createHexPanel()
{
    const shape = new THREE.Shape();

    shape.moveTo(-20, 24);
    shape.lineTo(20, 24);
    shape.lineTo(32, 0);
    shape.lineTo(20, -24);
    shape.lineTo(-20, -24);
    shape.lineTo(-32, 0);
    shape.closePath();

    return new THREE.Mesh(
        new THREE.ExtrudeGeometry(
            shape,
            {
                depth: 0.25,
                bevelEnabled: false
            }
        ),
        panelMaterial
    );
}

const frontCover =
    createHexPanel();

frontCover.position.z = 24;

covers.add(frontCover);

//
// REAR HEX COVER
//

const rearCover =
    createHexPanel();

rearCover.rotation.y =
    Math.PI;

rearCover.position.z =
    -24.25;

covers.add(rearCover);

//
// TOP COVER
//

const topCover =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            40,
            0.5,
            48
        ),
        panelMaterial
    );

topCover.position.set(
        0,
       24,
        0
);

covers.add(topCover);

//
// BOTTOM COVER
//

const bottomCover =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            40,
            0.5,
            48
        ),
        panelMaterial
    );

bottomCover.position.set(
        0,
      -24,
        0
);

covers.add(bottomCover);

//
// LEFT UPPER SIDE PANEL
//

const leftUpper =
    new THREE.Mesh(
        new THREE.BufferGeometry(),
        panelMaterial
    );

leftUpper.geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        new Float32Array([

            -20,24, 24,
            -32, 0, 24,
            -20,24,-24,

            -32, 0,24,
            -32, 0,-24,
            -20,24,-24

        ]),
        3
    )
);

leftUpper.geometry.computeVertexNormals();

covers.add(leftUpper);

//
// LEFT LOWER SIDE PANEL
//

const leftLower =
    new THREE.Mesh(
        new THREE.BufferGeometry(),
        panelMaterial
    );

leftLower.geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        new Float32Array([

            -32, 0,24,
            -20,-24,24,
            -32, 0,-24,

            -20,-24,24,
            -20,-24,-24,
            -32, 0,-24

        ]),
        3
    )
);

leftLower.geometry.computeVertexNormals();

covers.add(leftLower);

//
// RIGHT UPPER SIDE PANEL
//

const rightUpper =
    leftUpper.clone();

rightUpper.scale.x = -1;

covers.add(rightUpper);

//
// RIGHT LOWER SIDE PANEL
//

const rightLower =
    leftLower.clone();

rightLower.scale.x = -1;

covers.add(rightLower);

//
// Toggle Functions
//

window.hideAllCovers = () =>
{
    covers.visible = false;
};

window.showAllCovers = () =>
{
    covers.visible = true;
};

window.toggleCover = (name) =>
{
    switch(name)
    {
        case "front":
            frontCover.visible =
                !frontCover.visible;
            break;

        case "rear":
            rearCover.visible =
                !rearCover.visible;
            break;

        case "leftUpper":
            leftUpper.visible =
                !leftUpper.visible;
            break;

        case "leftLower":
            leftLower.visible =
                !leftLower.visible;
            break;

        case "rightUpper":
            rightUpper.visible =
                !rightUpper.visible;
            break;

        case "rightLower":
            rightLower.visible =
                !rightLower.visible;
            break;

        case "top":
            topCover.visible =
                !topCover.visible;
            break;

        case "bottom":
            bottomCover.visible =
                !bottomCover.visible;
            break;
    }
};

//
// Render
//
function animate()
{
    requestAnimationFrame(
        animate
    );

    renderer.render(
        scene,
        camera
    );
}

animate();

//
// Resize
//
window.addEventListener(
    'resize',
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