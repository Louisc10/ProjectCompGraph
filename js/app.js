import * as THREE from '../three.js/build/three.module.js';
import { GLTFLoader } from '../three.js/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from '../three.js/build/OrbitControls';

var renderer, scene;
var thirdPersonCamera, carDriverCamera, currCamera;
var control;

var asphalt;
var road;
var moonlight;
var streetlamp;
var building;
var text;
var car;

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
    thirdPersonCamera.position.copy(new THREE.Vector3(0, 100, 250));
    thirdPersonCamera.lookAt(new THREE.Vector3(0, 0, 0));

    carDriverCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    currCamera = thirdPersonCamera;

    // control = new OrbitControls(thirdPersonCamera, renderer.domElement);

    moonlight = makeMoonlight();
    scene.add(moonlight);

    asphalt = makeAsphalt();
    scene.add(asphalt);

    road = makeRoad();
    scene.add(road);

    streetlamp = [];
    for (let i = 0; i < 8; i++) {
        let temp = makeStreetlamp();
        streetlamp[i] = temp;
        scene.add(streetlamp[i]);

        streetlamp[i].position.x = i % 2 == 0 ? -20 : 20;
        streetlamp[i].position.z = (100 * (i % 2 == 0 ? (i / 2) : (i - 1) / 2)) - 150;
    }

    building = [];
    for (let i = 0; i < 40; i++) {
        let temp = makeBuilding();
        building[i] = temp;
        scene.add(building[i]);

        building[i].position.x = i % 2 == 0 ? -50 : 50;
        building[i].position.z = (25 * (i % 2 == 0 ? (i / 2) : (i - 1) / 2)) - 237.5;
    }

    makeText();

    make3DModel("../assets/model/model.glb");
}

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

var makeStreetlamp = function() {
    let poleHeight = 26;
    let pole = makePole(poleHeight);

    let lampContainerHeight = 3;
    let lampContainer = makeLampContainer(lampContainerHeight);
    pole.add(lampContainer);
    lampContainer.position.y = (poleHeight + lampContainerHeight) / 2;

    let lidHeight = 0;
    let lid = makeLid(lidHeight);
    lampContainer.add(lid);
    lid.position.y = (lampContainerHeight + lidHeight) / 2;

    let bulbRadius = 1;
    let bulb = makeBulb(bulbRadius);
    lampContainer.add(bulb);

    let light = makeBulbLight();
    bulb.add(light);

    return pole;
}

var makePole = function(height) {
    let radius = 0.5;
    let radial_segment = 64;
    let geometry = new THREE.CylinderGeometry(radius, radius, height, radial_segment);
    let material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#43464B"),
        metalness: 0.6,
        roughness: 0.1,
        castShadow: true
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2;
    return mesh;
}

var makeLampContainer = function(height) {
    let radiusTop = 4;
    let radiusBottom = 2;
    let radial_segment = 4;
    let height_segment = 1;
    let geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial_segment, height_segment);
    let material = new THREE.MeshPhongMaterial({
        wireframe: true,
        castShadow: true
    });

    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

var makeLid = function(height) {
    let radiusTop = 0;
    let radiusBottom = 4;
    let radial_segment = 4;
    let height_segment = 1;
    let geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial_segment, height_segment);
    let material = new THREE.MeshPhongMaterial({
        wireframe: true,
        castShadow: true
    });

    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

var makeBulb = function(bulbRadius) {
    let geometry = new THREE.SphereGeometry(bulbRadius);
    let material = new THREE.MeshPhongMaterial({
        side: THREE.BackSide
    });

    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

var makeBulbLight = function() {
    let intensity = 0.12;
    let light = new THREE.PointLight(new THREE.Color("#FFFFFF"), intensity);
    light.castShadow = true;

    return light;
}

var makeBuilding = function() {
    let width = 25;
    let depth = 25;
    let x = Math.floor(Math.random() * 3);
    let height = (x == 0) ? 60 : (x == 1) ? 90 : 120;

    let texture = new THREE.TextureLoader().load("../assets/building.jpg");

    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, height / 30);
    let geometry = new THREE.BoxGeometry(width, height, depth);
    let material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.65,
        roughness: 0.67,
        receiveShadow: true
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, height / 2, 0));

    return mesh;
}

var makeMoonlight = function() {
    let light = new THREE.PointLight({
        color: "#F4F1C9",
        distance: 1000,
        decay: 1.5
    });
    light.position.copy(new THREE.Vector3(0, 500, 250));

    return light;
}

var makeText = function() {

    let loader = new THREE.FontLoader().load("../three.js/examples/fonts/helvetiker_regular.typeface.json",
        function(response) {

            let textGeometry = new THREE.TextGeometry('     ST.' + '\nASHCRE', {
                font: response,
                size: 6,
                height: 5,
                curveSegments: 12
            })

            textGeometry.center();

            let material = new THREE.MeshStandardMaterial({ color: '#a6a6a6' });
            text = new THREE.Mesh(textGeometry, material);
            text.position.copy(new THREE.Vector3(0, 25, 0));

            scene.add(text);
        })

}

var make3DModel = function(url) {
    var loader = new GLTFLoader();
    loader.load(url, function(gltf) {
        car = gltf.scene;
        car.position.set(5.5, 0, 100);
        car.scale.set(3.5, 3.5, 3.5);
        car.rotation.y = -(Math.PI);
        car.rotation.z = 0;

        scene.add(car);
    })

}

var keyListener = function(event) {
    let key = event.keyCode;

    if (key == 17) {
        if (currCamera == carDriverCamera) {
            currCamera = thirdPersonCamera;
        } else {
            currCamera = carDriverCamera;
        }
    } else if (key == 87) {
        if (currCamera == carDriverCamera) {
            car.position.z -= 3;
        }
    } else if (key == 83) {
        if (currCamera == carDriverCamera) {
            car.position.z += 3;
        }
    }
}

window.addEventListener("keydown", keyListener);

var update = function() {
    if (car != null) {
        carDriverCamera.position.x = car.position.x;
        carDriverCamera.position.y = car.position.y + 10;
        carDriverCamera.position.z = car.position.z - 15;
    }
}

var render = function() {
    renderer.clear();
    renderer.setSize(window.innerWidth, window.innerHeight);
    thirdPersonCamera.aspect = window.innerWidth / window.innerHeight;
    thirdPersonCamera.updateProjectionMatrix();
    carDriverCamera.aspect = window.innerWidth / window.innerHeight;
    carDriverCamera.updateProjectionMatrix();

    renderer.render(scene, currCamera);
};

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