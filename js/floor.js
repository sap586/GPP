import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// axes.js

export function createFloor(scene, x, y)
{
    //
    // Floor
    //
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(
            x,
            y
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
    
    return {
        floor
    };
}