import * as THREE from '../three.js/build/three.module.js';
// import * as Asphalt from './Asphalt';

var renderer, scene;
var thirdPersonCamera, carDriverCamera;
var moonlight;

var asphalt;
var road;

var init = function() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x5555ff);

    const fov = 45;
    thirdPersonCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    thirdPersonCamera.position.copy(new THREE.Vector3(60, 40, 60));
    thirdPersonCamera.lookAt(new THREE.Vector3(0, 0, 0));

    carDriverCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    carDriverCamera.position.copy(new THREE.Vector3(60, 40, 60));
    carDriverCamera.lookAt(new THREE.Vector3(0, 0, 0));

    moonlight = new THREE.PointLight({
        color: "#F4F1C9",
        distance: 1000,
        decay: 1.5
    });
    moonlight.position.copy(new THREE.Vector3(0, 500, 250));
    scene.add(moonlight);

    asphalt = makeAsphalt();
    scene.add(asphalt);

    road = makeRoad();
    scene.add(road);
}

var update = function() {

}

var render = function() {
    renderer.clear();
    renderer.setSize(window.innerWidth, window.innerHeight);
    thirdPersonCamera.aspect = window.innerWidth / window.innerHeight;
    thirdPersonCamera.updateProjectionMatrix();

    renderer.render(scene, thirdPersonCamera);
};

var makeAsphalt = function() {
    let width = 500;
    let height = 500;
    let texture = new THREE.TextureLoader().load("../assets/asphalt.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);

    let geometry = new THREE.PlaneGeometry(width, height);
    let material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, 0, 0));

    mesh.rotation.x = Math.PI / 2;
    return mesh;
}

var makeRoad = function() {
    let width = 30;
    let height = 500;
    let texture = new THREE.TextureLoader().load("../assets/road.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 8);
    let geometry = new THREE.PlaneGeometry(width, height);
    let material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, 0.01, 0));

    mesh.rotation.x = Math.PI / 2;
    return mesh;
}

var gameLoop = function() {
    requestAnimationFrame(gameLoop);
    update();
    render();
};

window.addEventListener('resize', () => {
    render();
}, false);

init();
gameLoop();