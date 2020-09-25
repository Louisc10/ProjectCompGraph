import * as THREE from '../three.js/build/three.module.js';

var width = 500;
var height = 500;
var geometry, material, mesh;

export class Asphalt {

    constructor() {
        geometry = new THREE.PlaneGeometry(width, height);
        material = new THREE.MeshStandardMaterial();

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(new THREE.Vector3(0, 0, 0));

        mesh.rotation.x = Math.PI / 2;
        // return mesh;
    }
}