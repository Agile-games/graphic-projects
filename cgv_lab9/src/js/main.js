import * as THREE from 'three';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
// import * as THREEx from 'threex';

const menuPanel = document.getElementById('menuPanel');
const startButton = document.getElementById('startButton');
 
// Debug
const gui = new dat.GUI();

// For Monitoring Perfomance
const stats = new Stats();

// for smooth animation
var clock = new THREE.Clock();

// Initialize Keyboard state
// var keyboard = new THREEx.keyboardState();

// first person viewing
var firstpersonCameraControl;
var altFirstPersonCameraControl;

var canvas, renderer, scene, camera, textureLoader; // Standard three.js requirements.
var light;  // A light shining from the direction of the camera; moves with the camera.

var controls;  // An OrbitControls object that is used to implement
               // rotation of the scene using the mouse.  (It actually rotates
               // the camera around the scene.)

var cubeMat, floorMat;

var frameNumber = 0;  // Frame number is advanced by 1 for each frame while animating.

var tempObject;  // A temporary animated object.  DELETE IT.

const objects = []; // Keep track of objects in scene
var dragObjects;

var objectOne, objectTwo, objectThree, objectFour; // Objects in scene

/**
 *  The render function draws the scene.
 */
function render() {
    renderer.render(scene, camera);
}

/**
 * This function is called by the init() method to create the world. 
 */
function createWorld() {
    
    setRendererProperties(); // set renderer properties and add to scene
    
    // ------------------- Make a camera with viewpoint light ----------------------

    setCameraProperties(); // set camera and light properties and add to scene
    firstpersonCameraControl = new FirstPersonControls(camera, canvas);
    altFirstPersonCameraControl = new PointerLockControls(camera, canvas);

    // ----------------- Set up shadow properties for the light ---------------------
    
    setShadowProperties(); // set shadow properties and add to scene

    // ------------------ Adding More lights -------------------------------------

    addingMoreLights();

    // ----------------- Initialize Global texture Loader ------------------------

    textureLoader = new THREE.TextureLoader(); // Instantiate a loader
    
    //------------------- Create the scene's visible objects ----------------------

    // Add ground
    floorMat = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: 0xffffff,
        metalness: 0.2,
        bumpScale: 0.0005
    });
    createFloor();

    cubeMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.002,
        metalness: 0.2
    });

    // First Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectOne = new Cylinder_Prop(undefined, '/textures/tarmac2.jpg', 8, 10, 2, -8, 4, 0);
    objectOne.objectDefinition("tarmacObj"); // texture is initially undefined
    objectOne.addObjextToScene(12); // pass in the initial rotation value -> Math.PI/{value}
    objects.push(objectOne.getMesh());

    // Second Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectTwo = new Cylinder_Prop(undefined, '/textures/Leather.webp', 5, 20, 2, 8, 4, 0);
    objectTwo.objectDefinition("blackLeatherObj"); // texture is initially undefined
    objectTwo.addObjextToScene(6); // pass in the initial rotation value -> Math.PI/{value}
    objects.push(objectTwo.getMesh());

    // Third Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectThree = new Cylinder_Prop(undefined, '/textures/blackMat.jpg', 36, 2, 30, -8, -4, 0);
    objectThree.objectDefinition("blackMatObj"); // texture is initially undefined
    objectThree.addObjextToScene(1); // pass in the initial rotation value -> Math.PI/{value}
    objects.push(objectThree.getMesh());

    // Fourth Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectFour = new Cylinder_Prop(undefined, '/textures/pineWood.jpg', 0, 25, 0, 8, -4, 0);
    objectFour.objectDefinition("pineWoodObj"); // texture is initially undefined
    objectFour.addObjextToScene(3); // pass in the initial rotation value -> Math.PI/{value}
    objects.push(objectFour.getMesh());

    dragObjects = new DragControls(objects, camera, canvas);

    dragObjects.addEventListener('dragstart', event => {
        event.object.material.opacity = 0.5;
    });
    
    dragObjects.addEventListener('dragend', event => {
        event.object.material.opacity = 1;
    });

    doFrame();
} // end function createWorld()

function setRendererProperties () {
    renderer.setClearColor("black"); // Background color of scene.
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize(canvas.width, canvas.height);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
}

function setCameraProperties () {
    camera = new THREE.PerspectiveCamera(65, canvas.width/canvas.height, 0.1, 1000);
    camera.position.set(0, 0, 22);
    const cameraPos = gui.addFolder('Camera-Position');
    cameraPos.add(camera.position, 'x').min(-250).max(250).step(0.001);
    cameraPos.add(camera.position, 'y').min(-250).max(250).step(0.001);
    cameraPos.add(camera.position, 'z').min(-250).max(250).step(0.001);
    light = new THREE.DirectionalLight();
    light.position.set(0,0,1);
    light.intensity = 1.4;
    const cameraLight = gui.addFolder('Camera-Light');
    cameraLight.add(light, 'intensity').min(0).max(5).step(0.001);
    light.castShadow = true;
    camera.add(light);
    scene.add(camera);
}

function addingMoreLights () {
    // scene-Global Lighting (Ambient Light that illuminates the scene from the bird's eye view)
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.5)
    ambientLight.position.set(0, 33, 0);
    const globalLight = gui.addFolder('Global-Light');
    globalLight.add(ambientLight, 'intensity').min(0).max(5).step(0.001);
    scene.add(ambientLight);

    // Add a red light
    const Alight = new THREE.PointLight( 0xff0000, 0.2 );
    Alight.position.set(0.74, -11, -18);
    Alight.castShadow = false;
    const redLight = gui.addFolder('Red-Light');
    redLight.add(Alight.position, 'x').min(-50).max(50).step(0.001);
    redLight.add(Alight.position, 'y').min(-50).max(50).step(0.001);
    redLight.add(Alight.position, 'z').min(-50).max(50).step(0.001);
    redLight.add(Alight, 'intensity').min(0).max(60).step(0.001);
    var pointlightHelperOne = new THREE.PointLightHelper(Alight, 1);
    scene.add(Alight);
    scene.add(pointlightHelperOne);


    // Add a blue light
    const AlightTwo = new THREE.PointLight( 0x0000ff, 0.2 )
    AlightTwo.position.set(0, -7.934, 3.988);
    AlightTwo.castShadow = false;
    const blueLight = gui.addFolder('Blue-Light');
    blueLight.add(AlightTwo.position, 'x').min(-50).max(50).step(0.001);
    blueLight.add(AlightTwo.position, 'y').min(-50).max(50).step(0.001);
    blueLight.add(AlightTwo.position, 'z').min(-50).max(50).step(0.001);
    blueLight.add(AlightTwo, 'intensity').min(0).max(60).step(0.001);
    var pointlightHelperTwo = new THREE.PointLightHelper(AlightTwo, 1);
    scene.add(AlightTwo);
    scene.add(pointlightHelperTwo);

    // Add a dynamic light
    const dynamicLight = new THREE.PointLight(0x00ff00, 0.2);
    dynamicLight.position.set(-9.848, -2.128, 12.209);
    dynamicLight.castShadow = false;
    scene.add(dynamicLight);
    const dynamicL = gui.addFolder('Dynamic_Light');
    dynamicL.add(dynamicLight.position, 'x').min(-50).max(50).step(0.001);
    dynamicL.add(dynamicLight.position, 'y').min(-50).max(50).step(0.001);
    dynamicL.add(dynamicLight.position, 'z').min(-50).max(50).step(0.001);
    dynamicL.add(dynamicLight, 'intensity').min(0).max(60).step(0.001);

    let dynamicLightColor = { color: 0x00ff00 }
    dynamicL.addColor(dynamicLightColor, 'color').onChange(function() {
        dynamicLight.color.set(dynamicLightColor.color)
    })

    const pointlightHelperThree = new THREE.PointLightHelper(dynamicLight, 1);
    scene.add(pointlightHelperThree);

}

function setShadowProperties () {
    light.shadow.mapSize.width = 512; //default
    light.shadow.mapSize.height = 512 //default
    light.shadow.camera.near = 0.5; //default
    light.shadow.camera.far = 500; //default
}

function createFloor() {
    let position = { x: 0, y: -46, z: -18.413};
    let scale = { x: 458.03, y: 1.4, z: 338.92 };

    var floorTextureFile = '/textures/ground.jpg';
    var textureFloor = textureLoader.load(floorTextureFile, map => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(100, 24);
        // map.encoding = THREE.sRGBEncoding;
        floorMat.roughnessMap = map;
        floorMat.needsUpdate = true;
    });

    let Plane = new THREE.Mesh(new THREE.BoxBufferGeometry(),
        new THREE.MeshPhongMaterial({
            map: textureLoader.load(floorTextureFile, () => {
                return textureFloor;
            }, undefined, (err) => {
                console.log("An error occured");
                return null;
            }),
            roughness: 1,
            metalness: 0.2,
            shininess: 0.3,
            bumpScale: 0.0005
        }));
    Plane.position.set(position.x, position.y, position.z);
    Plane.scale.set(scale.x, scale.y, scale.z);
    const FloorPosition = gui.addFolder('Floor-Position');
    FloorPosition.add(Plane.position, 'x').min(-350).max(550).step(0.001);
    FloorPosition.add(Plane.position, 'y').min(-350).max(550).step(0.001);
    FloorPosition.add(Plane.position, 'z').min(-350).max(550).step(0.001);
    const FloorScaling = gui.addFolder('Floor-Scaling');
    FloorScaling.add(Plane.scale, 'x').min(-350).max(550).step(0.001);
    FloorScaling.add(Plane.scale, 'y').min(-350).max(550).step(0.001);
    FloorScaling.add(Plane.scale, 'z').min(-350).max(550).step(0.001);
    Plane.castShadow = true;
    Plane.receiveShadow = true;
    Plane.userData.ground = true;
    Plane.userData.name = "Ground";
    scene.add(Plane);

}

// Blueprint for Cylinder Objects to be placed in the scene
class Cylinder_Prop {
    constructor(tempObject, textureFile, shininess, roughness, metalness, x, y, z) {
        this.tempObject = tempObject;
        this.textureFile = textureFile;
        this.shininess = shininess;
        this.roughness = roughness;
        this.metalness = metalness;
        this.x = x;
        this.y = y;
        this.z = z;

        this.objectDefinition = (name) => {
            const texture = textureLoader.load(this.textureFile, map => {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(1, 1);
                map.encoding = THREE.sRGBEncoding;
                cubeMat.map = map;
                cubeMat.needsUpdate = true;
            });
            this.tempObject =  new THREE.Mesh( 
                new THREE.CylinderGeometry(4,4,6.5,4,8),
                new THREE.MeshPhongMaterial({
                    map: textureLoader.load(this.textureFile, () => {
                        return texture;
                    }, undefined, (err) => {
                        console.log("An error occured");
                        return null;
                    }),
                    specular: 0x222222,
                    shininess: this.shininess,
                    // shading: THREE.FlatShading,
                    roughness: this.roughness, 
                    metalness: this.metalness
                })
            );
            this.tempObject.receiveShadow = true;
            this.tempObject.castShadow = true;
        }

        this.getMesh = () => {
            return this.tempObject;
        }

        this.addObjextToScene = (position) => {
            this.tempObject.rotation.y = Math.PI/position;
            this.tempObject.castShadow = true;
            this.tempObject.receiveShadow = false;
            this.tempObject.position.set(this.x, this.y, this.z);
            scene.add(this.tempObject);
        }

        this.update = (scaleFactor) => {
            this.tempObject.scale.set(scaleFactor,scaleFactor,scaleFactor);
            this.tempObject.rotation.y += 0.01;
        }
    }
}

// ========================== Handling Event Listners =================================

window.addEventListener('resize', onWindowResize, false);

startButton.addEventListener('click', () => {
    controls.lock();
}, false)

document.addEventListener('keydown', event => {
    let moveDistance = 35 * clock.getDelta();
    switch(event.code) {
        case 'KeyW':
            controls.moveForward(moveDistance);
            break;
        case 'KeyA':
            controls.moveRight(-moveDistance);
            break;
        case 'KeyS':
            controls.moveForward(-moveDistance);
            break;
        case 'KeyD':
            controls.moveRight(moveDistance);
            break;
    }
}, false);

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 *  This function is called once for each frame of the animation, before
 *  the render() function is called for that frame.  It updates any
 *  animated properties.  The value of the global variable frameNumber
 *  is incrementd 1 before this function is called.
 */
function updateForFrame() {
    // Update size and rotation of tempObject.  DELETE THIS!
    var loopFrame = frameNumber % 240;
    if (loopFrame > 120) {
        loopFrame = 240 - loopFrame;
    }

    // let moveDistance = clock.getDelta();

    // var scaleFactor = 1 + loopFrame/120;
    // dragObject();
    var scaleFactor = 1;
    // camera.lookAt(scene.position);
    objectOne.update(scaleFactor);
    objectTwo.update(scaleFactor);
    objectThree.update(scaleFactor);
    objectFour.update(scaleFactor);
    // firstpersonCameraControl.update(moveDistance);
    // altFirstPersonCameraControl.update(moveDistance);
}

/* ---------------------------- MOUSE AND ANIMATION SUPPORT ------------------

/**
 *  This page uses THREE.FirstPersonControls or THREE.PointerLockControls to let the user use the mouse to rotate
 *  the view.  FirstPersonControls and PointerLockControls are designed to be used during an animation, where
 *  the rotation is updated as part of preparing for the next frame.  The scene
 *  is not automatically updated just because the user drags the mouse.  To get
 *  the rotatio one touch.
 */
function installFirstPersonControls () {
    firstpersonCameraControl.lookSpeed = 0.09;
    firstpersonCameraControl.movementSpeed = 75;
}

function installPointerLockControls () {
    controls = new PointerLockControls(camera, canvas);
    controls.addEventListener('lock', () => {
        menuPanel.style.display = 'none';
    });
    controls.addEventListener('unlock', () => {
        menuPanel.style.display = 'block'
    });
}

/*  Drives the animation, called by system through requestAnimationFrame() */
function doFrame() {
    // Initialize FPS counter
    stats.begin();

    frameNumber++;
    updateForFrame();
    render();
    requestAnimationFrame(doFrame);
    
    stats.end();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom) // Show FPS counter on canvas
}

/*----------------------------- INITIALIZATION ----------------------------------------

/**
 *  This function is called by the onload event so it will run after the
 *  page has loaded.  It creates the renderer, canvas, and scene objects,
 *  calls createWorld() to add objects to the scene, and renders the
 *  initial view of the scene.  If an error occurs, it is reported.
 */
function init() {
    try {
        canvas = document.getElementById("glcanvas");
        renderer = new THREE.WebGLRenderer({ // Initialize renderer
            canvas: canvas,
            antialias: true,
            alpha: false
        });
    }
    catch (e) {
        document.getElementById("message").innerHTML="<b>Sorry, an error occurred:<br>" +
                e + "</b>";
        return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createWorld();
    // installOrbitControls();
    installPointerLockControls();
    installFirstPersonControls();
    render();
}
init();