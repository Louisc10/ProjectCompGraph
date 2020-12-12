import * as THREE from '../three.js/build/three.module.js';
import { GLTFLoader } from '../three.js/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../three.js/build/OrbitControls.js';

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
var background;

let rightLight, leftLight;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

var init = function() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x444444);

    const fov = 45;
    thirdPersonCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    thirdPersonCamera.position.copy(new THREE.Vector3(0, 100, 250));
    thirdPersonCamera.lookAt(new THREE.Vector3(0, 0, 0));

    carDriverCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    currCamera = thirdPersonCamera;

    control = new OrbitControls(thirdPersonCamera, renderer.domElement);
    control.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
    }

    moonlight = makeMoonlight();
    scene.add(moonlight);

    asphalt = makeAsphalt();
    scene.add(asphalt);

    background = makeBackgroundSkyBox();
    scene.add(background);

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
    let streetLamp = new THREE.Group();

    let poleHeight = 26;
    let pole = makePole(poleHeight);
    streetLamp.add(pole);

    let lampContainerHeight = 3;
    let lampContainer = makeLampContainer(lampContainerHeight);
    streetLamp.add(lampContainer);
    lampContainer.position.y = poleHeight + (lampContainerHeight / 2);

    let lidHeight = 1;
    let lid = makeLid(lidHeight);
    streetLamp.add(lid);
    lid.position.y = poleHeight + lampContainerHeight + (lidHeight / 2);

    let bulbRadius = 1;
    let bulb = makeBulb(bulbRadius);
    streetLamp.add(bulb);
    bulb.position.y = poleHeight + bulbRadius;

    let light = makeBulbLight();
    streetLamp.add(light);
    light.position.y = poleHeight + bulbRadius;

    return streetLamp;
}

var makePole = function(height) {
    let radius = 0.5;
    let radial_segment = 64;
    let geometry = new THREE.CylinderGeometry(radius, radius, height, radial_segment);
    let material = new THREE.MeshStandardMaterial({
        color: 0x43464B,
        metalness: 0.6,
        roughness: 0.1,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
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
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
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
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
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
    let intensity = 1;
    let distance = 100;
    let light = new THREE.PointLight(new THREE.Color("#FFFFFF"), intensity, distance);
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
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(0, height / 2, 0));
    mesh.receiveShadow = true;

    return mesh;
}

var makeMoonlight = function() {
    let light = new THREE.PointLight({
        color: 0xF4F1C9,
        distance: 1000,
        decay: 1.5
    });
    light.position.copy(new THREE.Vector3(0, 500, 250));

    return light;
}

var makeSpotlight = function() {
    let light = new THREE.SpotLight(0xffffff);
    light.angle = THREE.Math.degToRad(15)
    light.intensity = 2.5
    return light;
}

var makeText = function() {
    new THREE.FontLoader().load("../three.js/examples/fonts/helvetiker_regular.typeface.json",
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
        car.position.set(7, 0, 100);
        car.scale.set(4.5, 4.5, 4.5);
        car.rotation.y = -(Math.PI);
        car.rotation.z = 0;

        leftLight = makeSpotlight();
        leftLight.position.x -= 0.5

        rightLight = makeSpotlight();
        rightLight.position.x += 0.5

        car.add(leftLight);
        car.add(rightLight);

        scene.add(car);
    })
}

var makeBackgroundSkyBox = function() {
    //px, nx, py, ny, pz, nz
    let geometry = new THREE.BoxGeometry(500, 500, 500);
    // geometry.colors();
    let texture1 = new THREE.TextureLoader().load("../assets/cubemap/px.png");
    let texture2 = new THREE.TextureLoader().load("../assets/cubemap/nx.png");
    let texture3 = new THREE.TextureLoader().load("../assets/cubemap/py.png");
    let texture4 = new THREE.TextureLoader().load("../assets/cubemap/ny.png");
    let texture5 = new THREE.TextureLoader().load("../assets/cubemap/pz.png");
    let texture6 = new THREE.TextureLoader().load("../assets/cubemap/nz.png");
    let material1 = new THREE.MeshBasicMaterial({
        map: texture1,
        color: 0x777777,
        side: THREE.BackSide
    });
    let material2 = new THREE.MeshBasicMaterial({
        map: texture2,
        color: 0x777777,
        side: THREE.BackSide
    });
    let material3 = new THREE.MeshBasicMaterial({
        map: texture3,
        color: 0x777777,
        side: THREE.BackSide
    });
    let material4 = new THREE.MeshBasicMaterial({
        map: texture4,
        color: 0x777777,
        side: THREE.BackSide
    });
    let material5 = new THREE.MeshBasicMaterial({
        map: texture5,
        color: 0x777777,
        side: THREE.BackSide
    });
    let material6 = new THREE.MeshBasicMaterial({
        map: texture6,
        color: 0x777777,
        side: THREE.BackSide
    });
    let materials = [
        material1,
        material2,
        material3,
        material4,
        material5,
        material6
    ]
    let skyBoxMesh = new THREE.Mesh(geometry, materials);
    skyBoxMesh.position.copy(new THREE.Vector3(0, -70, 0));
    return skyBoxMesh;
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
            if (car.position.z > -230)
                car.position.z -= 3;
        }
    } else if (key == 83) {
        if (currCamera == carDriverCamera) {
            if (car.position.z < 230)
                car.position.z += 3;
        }
    }
}

var mouseClickListener = function(event) {
    let key = event.which;
    if (key == 3) {
        let w = window.innerWidth
        let h = window.innerHeight
        mouse.x = event.clientX / w * 2 - 1
        mouse.y = event.clientY / h * -2 + 1

        raycaster.setFromCamera(mouse, currCamera)

        let x = []
        streetlamp.forEach(i => {
            x.push(i.children[3]);
        });
        let items = raycaster.intersectObjects(x)
        items.forEach(i => {
            streetlamp.forEach(j => {
                if (j.children[3].uuid.localeCompare(i.object.uuid) == 0)
                    if (j.children[4].intensity == 0) {
                        j.children[4].intensity = 1;
                        j.children[3].side = THREE.BackSide;

                    } else {
                        j.children[4].intensity = 0;
                        j.children[3].side = THREE.FrontSide;
                    }
            });
        })
    }
}

window.addEventListener("keydown", keyListener);
window.addEventListener("mousedown", mouseClickListener);

var update = function() {
    if (thirdPersonCamera.position.x < -35) {
        thirdPersonCamera.position.x = -35;
    } else if (thirdPersonCamera.position.x > 35) {
        thirdPersonCamera.position.x = 35;
    }
    if (thirdPersonCamera.position.y < 1) {
        thirdPersonCamera.position.y = 1;
    }

    if (car != null) {
        carDriverCamera.position.x = car.position.x;
        carDriverCamera.position.y = car.position.y + 10;
        carDriverCamera.position.z = car.position.z - 15;
        thirdPersonCamera.lookAt(car.position);
        renderLight();
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

var renderLight = function() {
    leftLight.target.position.z = -500;
    leftLight.target.updateMatrixWorld();
    rightLight.target.position.z = -500;
    rightLight.target.updateMatrixWorld();
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