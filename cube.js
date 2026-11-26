import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CameraControls }	from './cameraControls.js';
import { createMachine }	from './covers.js';
import { createGridAxes }	from './axes.js';

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

const {
    xArrow,
    yArrow,
    zArrow,
    xLabel,
    yLabel,
    zLabel
}
=
createGridAxes(scene);

const {
    machine,
    covers,

    frontCover,
    rearCover,
    leftUpper,
    leftLower,
    rightUpper,
    rightLower,
    topCover,
    bottomCover

} = createMachine(scene);

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




window.setTopView = function()
{
    camera.position.set(0, 150, 0);
    camera.lookAt(0, 0, 0);
	currentLookAt.set(0, 0, 0);
};

window.setFrontView = function()
{
    camera.position.set(0, 5, 25);
    camera.lookAt(0, 0, 0);
	currentLookAt.set(0, 0, 0);
};

window.setSideView = function()
{
    camera.position.set(25, 5, 0);
    camera.lookAt(0, 0, 0);
	currentLookAt.set(0, 0, 0);
};

window.setRearView = function()
{
    camera.position.set(0, 5, -25);
    camera.lookAt(0, 0, 0);
	currentLookAt.set(0, 0, 0);
};


const currentLookAt = new THREE.Vector3(0, 0, 0);

function updateCameraInfo()
{
	const rotX = THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(2);
	const rotY = THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(2);
	const rotZ = THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(2);

    document.getElementById("cameraInfo").innerHTML =
        "pos : (" + camera.position.x.toFixed(2) + ", " + camera.position.y.toFixed(2) + ", " + camera.position.z.toFixed(2) + ")" + "<br>" +
		"rot : (" + rotX + ", " + rotY + ", " + rotZ + ")" + "<br>" +
        "look: (" + currentLookAt.x.toFixed(2) + ", " + currentLookAt.y.toFixed(2) + ", " + currentLookAt.z.toFixed(2) + ")"
		;
}

//
// Render
//
function animate()
{
    requestAnimationFrame(
        animate
    );

	updateCameraInfo();

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