var renderer, scene, camera, cube;

var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight,
  FOV = 75, // field of view
  NEAR = 1, // near clipping plane
  FAR = 1000; // far clipping plane

function populateScene() {
  // Every 3D object is a combination of a geometry and a material
  const geometry = new THREE.BoxGeometry();
  const material = [];
  const faceColors = ["red", "blue", "green", "white", "orange", "yellow"];

  faceColors.forEach((color) => {
    let currentMatrial = new THREE.MeshBasicMaterial({ color: color });
    material.push(currentMatrial);
  });

  // Creating shape by meshing together the geometry and the material
  cube = new THREE.Mesh(geometry, material);

  // Adding cube to the scene
  scene.add(cube);

  // Moving the camera further away from the view
  camera.position.z = 2;
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, NEAR, FAR);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  window.addEventListener("resize", () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectMatrix();
  });

  document.body.appendChild(renderer.domElement);
  populateScene();
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

init();
