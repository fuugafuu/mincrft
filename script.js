const container = document.getElementById('container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d8ef);

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(new THREE.AmbientLight(0xcccccc));
scene.add(light);

// 地面生成
const blockSize = 1;
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
for (let x = -5; x <= 5; x++) {
  for (let z = -5; z <= 5; z++) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(blockSize, blockSize, blockSize), groundMaterial);
    block.position.set(x, 0, z);
    block.userData.ground = true;
    scene.add(block);
  }
}

// キャラクター作成
const char = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
char.position.set(0, 1, 0);
scene.add(char);

// キャラ移動
window.addEventListener("keydown", (e) => {
  const step = 0.5;
  if (e.key === 'w') char.position.z -= step;
  if (e.key === 's') char.position.z += step;
  if (e.key === 'a') char.position.x -= step;
  if (e.key === 'd') char.position.x += step;
});

// レイキャスターとブロック設置
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const groundBlocks = scene.children.filter(obj => obj.userData.ground);
  const intersects = raycaster.intersectObjects(groundBlocks);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(blockSize, blockSize, blockSize),
      new THREE.MeshLambertMaterial({ color: 0xffaa00 })
    );
    block.position.set(Math.floor(point.x + 0.5), 1, Math.floor(point.z + 0.5));
    scene.add(block);
  }
});

// カメラリサイズ対応
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// ノードエディター（RDApi）
const rd = new RDAPI.Editor();
document.getElementById('editorContainer').appendChild(rd.el);

// 初期ノード追加
rd.createNode("Start", { x: 50, y: 50 });
rd.createNode("Block Action", { x: 150, y: 150 });

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
