import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class CameraControls {

    constructor(camera, domElement) {

        this.camera = camera;
        this.domElement = domElement;

        this.target = new THREE.Vector3(0, 0, 0);

        // Spherical coordinates
        this.radius = camera.position.length();

        this.theta = Math.atan2(
            camera.position.x,
            camera.position.z
        );

        this.phi = Math.acos(
            camera.position.y / this.radius
        );

        this.minRadius = 20;
        this.maxRadius = 300;

        this.rotateSpeed = 0.005;
        this.zoomSpeed = 0.1;

        this.isRotating = false;

        this.previousMouse = {
            x: 0,
            y: 0
        };

        this.addListeners();
        this.updateCamera();
    }

    addListeners() {

        //
        // Prevent browser middle-click scrolling
        //
        this.domElement.addEventListener(
            "mousedown",
            (event) => {

                if (event.button === 1) {

                    event.preventDefault();

                    this.isRotating = true;

                    this.previousMouse.x = event.clientX;
                    this.previousMouse.y = event.clientY;
                }
            }
        );

        window.addEventListener(
            "mouseup",
            () => {
                this.isRotating = false;
            }
        );

        window.addEventListener(
            "mousemove",
            (event) => {

                if (!this.isRotating) return;

                const dx =
                    event.clientX -
                    this.previousMouse.x;

                const dy =
                    event.clientY -
                    this.previousMouse.y;

                this.theta -=
                    dx * this.rotateSpeed;

                this.phi -=
                    dy * this.rotateSpeed;

                //
                // Prevent camera flip
                //
                const eps = 0.01;

                this.phi = Math.max(
                    eps,
                    Math.min(
                        Math.PI - eps,
                        this.phi
                    )
                );

                this.previousMouse.x =
                    event.clientX;

                this.previousMouse.y =
                    event.clientY;

                this.updateCamera();
            }
        );

        this.domElement.addEventListener(
            "wheel",
            (event) => {

                event.preventDefault();

                const zoomFactor =
                    1 + event.deltaY * 0.001;

                this.radius *= zoomFactor;

                this.radius = Math.max(
                    this.minRadius,
                    Math.min(
                        this.maxRadius,
                        this.radius
                    )
                );

                this.updateCamera();

            },
            { passive: false }
        );
    }

    updateCamera() {

        this.camera.position.x =
            this.radius *
            Math.sin(this.phi) *
            Math.sin(this.theta);

        this.camera.position.y =
            this.radius *
            Math.cos(this.phi);

        this.camera.position.z =
            this.radius *
            Math.sin(this.phi) *
            Math.cos(this.theta);

        this.camera.lookAt(this.target);
    }
}