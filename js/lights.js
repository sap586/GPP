import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createLights(scene)
{
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
    
    return {
        ambient,
        light
    };
}