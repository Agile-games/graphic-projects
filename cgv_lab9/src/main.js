import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// Debug
const gui = new dat.GUI();

// For Monitoring Perfomance
const stats = new Stats();

var canvas, renderer, scene, camera, textureLoader; // Standard three.js requirements.
var light;  // A light shining from the direction of the camera; moves with the camera.

var controls;  // An OrbitControls object that is used to implement
               // rotation of the scene using the mouse.  (It actually rotates
               // the camera around the scene.)

var cubeMat, floorMat;

var animating = false;  // Set to true when an animation is in progress.
var frameNumber = 0;  // Frame number is advanced by 1 for each frame while animating.

var tempObject;  // A temporary animated object.  DELETE IT.

var objectOne, objectTwo, objectThree, objectFour; // Objects in scene
let rayCaster, clickMouse, moveMouse, draggable; // Requirements for dragging around objects

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

    // ----------------- Set up shadow properties for the light ---------------------
    
    setShadowProperties(); // set shadow properties and add to scene

    // ------------------ Adding More lights -------------------------------------

    addingMoreLights();

    // ----------------- Initialize Global texture Loader ------------------------

    textureLoader = new THREE.TextureLoader(); // Instantiate a loader
    
    //------------------- Create the scene's visible objects ----------------------

    // Add ground
    createFloor();
    floorMat = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: 0xffffff,
        metalness: 0.2,
        bumpScale: 0.0005
    });

    cubeMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.002,
        metalness: 0.2
    });

    /*
        Initialize raycaster and every helper variable 
    */
    rayCaster = new THREE.Raycaster();
    clickMouse = new THREE.Vector2();
    moveMouse = new THREE.Vector2();
    draggable: THREE.Object3D;

    // First Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectOne = new Cylinder_Prop(undefined, '/textures/tarmac2.jpg', 8, 10, 2, -8, 4, 0);
    objectOne.objectDefinition("tarmacObj"); // texture is initially undefined
    objectOne.addObjextToScene(12); // pass in the initial rotation value -> Math.PI/{value}

    // Second Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectTwo = new Cylinder_Prop(undefined, '/textures/Leather.webp', 5, 20, 2, 8, 4, 0);
    objectTwo.objectDefinition("blackLeatherObj"); // texture is initially undefined
    objectTwo.addObjextToScene(6); // pass in the initial rotation value -> Math.PI/{value}

    // Third Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectThree = new Cylinder_Prop(undefined, '/textures/blackMat.jpg', 36, 2, 30, -8, -4, 0);
    objectThree.objectDefinition("blackMatObj"); // texture is initially undefined
    objectThree.addObjextToScene(1); // pass in the initial rotation value -> Math.PI/{value}

    // Fourth Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, roughness, metalness, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectFour = new Cylinder_Prop(undefined, '/textures/pineWood.jpg', 0, 25, 0, 8, -4, 0);
    objectFour.objectDefinition("pineWoodObj"); // texture is initially undefined
    objectFour.addObjextToScene(3); // pass in the initial rotation value -> Math.PI/{value}
    doFrame();
} // end function createWorld()

function setRendererProperties () {
    renderer.setClearColor("black"); // Background color of scene.
    renderer.physicallyCorrectLights = true;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    // renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // renderer.setPixelRatio(window.devicePixelRatio);
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
    // scene-Global Lighting (Ambient Light that illuminates the scene from above)
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.5)
    ambientLight.position.set(0, 33, 0);
    ambientLight.castShadow = true;
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
    redLight.add(Alight, 'intensity').min(0).max(15).step(0.001);
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
    blueLight.add(AlightTwo, 'intensity').min(0).max(15).step(0.001);
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
    dynamicL.add(dynamicLight, 'intensity').min(0).max(15).step(0.001);

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
    let position = { x: 0, y: -46, z: -97.82};
    let scale = { x: 408.40, y: 1.4, z: 160.25 };

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
            tempObject =  new THREE.Mesh( 
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
            tempObject.userData.draggable = true;
            tempObject.userData.name = name;
            tempObject.receiveShadow = true;
            tempObject.castShadow = true;
        }

        this.addObjextToScene = (position) => {
            tempObject.rotation.y = Math.PI/position;
            tempObject.castShadow = true;
            tempObject.receiveShadow = false;
            tempObject.position.set(this.x, this.y, this.z);
            scene.add(tempObject);
        }

        this.update = (scaleFactor) => {
            tempObject.scale.set(scaleFactor,scaleFactor,scaleFactor);
            tempObject.rotation.y += 0.01;
        }
    }
}

function keyCameraTranslate () {
    document.addEventListener('keypress', function(e) {
        if (e.key === 'w') {
            camera.position.z -= 1.5; 
        } else if (e.key === 'a') {
            camera.position.x -= 1.5;
        } else if (e.key === 'd') {
            camera.position.x += 1.5;
        } else if (e.key === 's') { 
            camera.position.z += 1.5;
        }
    }, false)
}

// ========================== Handling Event Listners =================================

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', event => {

    if (draggable) {
        console.log(`dropping draggable ${draggable.userData.name}`);
        draggable = null;
        return;
    }

    clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    clickMouse.y = ( event.clientY / window.innerHeight ) * 2 - 1;

    rayCaster.setFromCamera( clickMouse, camera );
    const foundObject = rayCaster.intersectObjects( scene.children );
    if (foundObject.length > 0 && foundObject[0].object.userData.draggable) {
        draggable = foundObject[0].object;
        console.log(`found draggable ${draggable.userData.name}`);
    }
});

window.addEventListener('mousemove', event => {
    moveMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    moveMouse.y = ( event.clientY / window.innerHeight ) * 2 - 1;
});

function dragObject() {
    if (draggable != null) {
        rayCaster.setFromCamera(moveMouse, camera);
        const foundObject = rayCaster.intersectObjects(scene.children);
        if (foundObject.length > 0) {
            for (let i of foundObject) {
                if (!i.object.userData.ground) {
                    continue
                }
                // draggable.position = {x: i.point.x, y: i.point.y, z: i.point.z};
                draggable.position.x = i.point.x;
                draggable.position.y = i.point.y;
                draggable.position.z = i.point.z;
            }
        }
    }
}

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
    // var scaleFactor = 0.9 + loopFrame/1220;
    // dragObject();
    var scaleFactor = 1;
    camera.lookAt(scene.position);
    objectOne.update(scaleFactor);
    objectTwo.update(scaleFactor);
    objectThree.update(scaleFactor);
    objectFour.update(scaleFactor);
    
}


/* ---------------------------- MOUSE AND ANIMATION SUPPORT ------------------

/**
 *  This page uses THREE.OrbitControls to let the user use the mouse to rotate
 *  the view.  OrbitControls are designed to be used during an animation, where
 *  the rotation is updated as part of preparing for the next frame.  The scene
 *  is not automatically updated just because the user drags the mouse.  To get
 *  the rotatio one touch.
 */
function installOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.noPan = true; 
    controls.noZoom = true;
    controls.staticMoving = false;
    function move() {
        controls.update();
        // if (! animating) {
            render();
        // }
    }
    function down() {
        document.addEventListener("mousemove", move, false);
    }
    function up() {
        document.removeEventListener("mousemove", move, false);
    }
    function touch(event) {
        if (event.touches.length == 1) {
            move();
        }
    }
    canvas.addEventListener("mousedown", down, false);
    canvas.addEventListener("mouseUP", up, false);
    canvas.addEventListener("touchmove", touch, false);
}

function installPointerLockControls () {
    const controls = new PointerLockControls( camera, document.body );

    // add event listener to show/hide a UI (e.g. the game's menu)

    controls.addEventListener( 'lock', function () {

        menu.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

        menu.style.display = 'block';

    } );
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
    render();
}
init();