import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CameraControls }	from './cameraControls.js';
import { createMachine }	from './machine.js';
import { createGridAxes }	from './axes.js';
import { createFloor }	    from './floor.js';
import { createLights }	    from './lights.js';
import { setupControls }    from './controls.js';
import { setupViewControls }    from './controls.js';

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

const {
    ambient,
    light
} = createLights(scene);

const {
    floor
} = createFloor(scene, 900, 300);

const {
    xArrow,
    yArrow,
    zArrow,
    xLabel,
    yLabel,
    zLabel
} = createGridAxes(scene);

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
} = createMachine(scene, 90);

//
// Toggle Functions
//

setupControls(covers,
    frontCover,
    rearCover,
    leftUpper,
    leftLower,
    rightUpper,
    rightLower,
    topCover,
    bottomCover);

const currentLookAt = new THREE.Vector3(0, 0, 0);
setupViewControls(camera, currentLookAt);





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