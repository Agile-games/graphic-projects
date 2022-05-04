import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Debug
const gui = new dat.GUI();

var canvas, renderer, scene, camera, textureLoader; // Standard three.js requirements.
var light;  // A light shining from the direction of the camera; moves with the camera.

var controls;  // An OrbitControls object that is used to implement
               // rotation of the scene using the mouse.  (It actually rotates
               // the camera around the scene.)

var animating = false;  // Set to true when an animation is in progress.
var frameNumber = 0;  // Frame number is advanced by 1 for each frame while animating.

var tempObject;  // A temporary animated object.  DELETE IT.

var mouseX = 0, mouseY = 0;
var objectOne, objectTwo, objectThree, objectFour;
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

    // First Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectOne = new Cylinder_Prop(undefined, '/textures/brownWooden.jpg', 2, 30, 0, -8, 4, 0);
    objectOne.objectDefinition(undefined); // texture is initially undefined
    objectOne.addObjextToScene(12); // pass in the initial rotation value -> Math.PI/{value}

    // Second Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectTwo = new Cylinder_Prop(undefined, '/textures/blackLeatherSteel.jpg', 12, 10, 5, 8, 4, 0);
    objectTwo.objectDefinition(undefined); // texture is initially undefined
    objectTwo.addObjextToScene(6); // pass in the initial rotation value -> Math.PI/{value}

    // Third Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectThree = new Cylinder_Prop(undefined, '/textures/blackMat.jpg', 36, 2, 30, -8, -4, 0);
    objectThree.objectDefinition(undefined); // texture is initially undefined
    objectThree.addObjextToScene(1); // pass in the initial rotation value -> Math.PI/{value}

    // Fourth Object
    // Prop-Parameters(tempObject, textureFile, shininess-value, x, y, z)
    // tempObject so that we can create a mesh blueprint
    objectFour = new Cylinder_Prop(undefined, '/textures/pineWood.jpg', 0, 25, 0, 8, -4, 0);
    objectFour.objectDefinition(undefined); // texture is initially undefined
    objectFour.addObjextToScene(3); // pass in the initial rotation value -> Math.PI/{value}
    doFrame();
} // end function createWorld()

function setRendererProperties () {
    renderer.setClearColor("black"); // Background color of scene.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
}

function setCameraProperties () {
    camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
    camera.position.z = 20;
    light = new THREE.DirectionalLight();
    light.position.set(0,0,1);
    light.castShadow = true;
    camera.add(light);
    scene.add(camera);
    gui.add(camera.position, 'z').min(-70).max(70).step(0.01);
}

function addingMoreLights () {
    const Alight = new THREE.PointLight( 0xff0000, 2.364 );
    Alight.position.set(0.74, -11, -18);
    gui.add(Alight.position, 'x').min(-50).max(50).step(0.001);
    gui.add(Alight.position, 'y').min(-50).max(50).step(0.001);
    gui.add(Alight.position, 'z').min(-50).max(50).step(0.001);
    gui.add(Alight, 'intensity').min(0).max(10).step(0.001);
    scene.add(Alight);

    const AlightTwo = new THREE.PointLight( 0x0000ff, 1.172 )
    AlightTwo.position.set(0, -7.934, 3.988);
    gui.add(AlightTwo.position, 'x').min(-50).max(50).step(0.001);
    gui.add(AlightTwo.position, 'y').min(-50).max(50).step(0.001);
    gui.add(AlightTwo.position, 'z').min(-50).max(50).step(0.001);
    gui.add(AlightTwo, 'intensity').min(0).max(10).step(0.001);
    scene.add(AlightTwo);
}

function setShadowProperties () {
    light.shadow.mapSize.width = 212; //default
    light.shadow.mapSize.height = 512 //default
    light.shadow.camera.near = 0.5; //default
    light.shadow.camera.far = 500; //default
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

        this.objectDefinition = (texture) => {
            texture = textureLoader.load(this.textureFile);
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

function onDocumentMouseMove (event) {
    mouseX = ((event.clientX - (canvas.width / 2)) / 20);
    mouseY = ((event.clientY - (canvas.height / 2)) / 20);
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
    var scaleFactor = 1;
    camera.position.x += (mouseX - camera.position.x) * .5;
    camera.position.y += (-mouseY - camera.position.y) * .5;
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
    controls = new OrbitControls(camera,canvas);
    controls.noPan = true; 
    controls.noZoom = true;
    controls.staticMoving = true;
    function move() {
        controls.update();
        if (! animating) {
            render();
        }
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
    canvas.addEventListener("touchmove", touch, false);
}

/*  Drives the animation, called by system through requestAnimationFrame() */
function doFrame() {
        window.addEventListener('resize', onWindowResize, false);
        frameNumber++;
        updateForFrame();
        render();
        requestAnimationFrame(doFrame);
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
    installOrbitControls();
    render();
}
init();