var renderer, scene, camera, cube;

var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight,
  FOV = 75,
  NEAR = 1,
  FAR = 1000;

function populateScene() {
  // Every 3D object is a combination of a geometry and a material
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

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

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

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
