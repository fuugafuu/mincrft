const container = document.getElementById('container');

// シーン作成
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// カメラ作成
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);

// レンダラー作成
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// マテリアル
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x00cc00 });
const dirtMaterial = new THREE.MeshLambertMaterial({ color: 0x885522 });

const blockSize = 1;

// 地面作成（5x5）
for (let x = -2; x <= 2; x++) {
  for (let z = -2; z <= 2; z++) {
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

    const dirtBlock = new THREE.Mesh(geometry, dirtMaterial);
    dirtBlock.position.set(x, -1, z);
    scene.add(dirtBlock);

    const grassBlock = new THREE.Mesh(geometry, grassMaterial);
    grassBlock.position.set(x, 0, z);
    grassBlock.userData.isGround = true; // 地面フラグ
    scene.add(grassBlock);
  }
}

// キャラクター追加
const charGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
const charMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
const character = new THREE.Mesh(charGeometry, charMaterial);
character.position.set(0, 0.9, 0);
scene.add(character);

// キャラ移動用キーボードイベント
window.addEventListener('keydown', (e) => {
  const step = 0.3;
  switch (e.key.toLowerCase()) {
    case 'w':
      character.position.z -= step;
      break;
    case 's':
      character.position.z += step;
      break;
    case 'a':
      character.position.x -= step;
      break;
    case 'd':
      character.position.x += step;
      break;
  }
});

// マウスドラッグで視点回転
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

container.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

container.addEventListener('mouseup', () => {
  isDragging = false;
});

container.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    const rotationSpeed = 0.005;
    scene.rotation.y += deltaX * rotationSpeed;
    scene.rotation.x += deltaY * rotationSpeed;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

// レイキャスターとマウス座標
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// クリックでブロック設置
window.addEventListener('click', (event) => {
  // マウス座標を正規化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // 地面ブロックだけを対象に
  const groundBlocks = scene.children.filter(obj => obj.userData.isGround);
  const intersects = raycaster.intersectObjects(groundBlocks);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    const blockPos = new THREE.Vector3(
      Math.floor(point.x + 0.5),
      1, // 地面の上に置く
      Math.floor(point.z + 0.5)
    );

    // 新しい草ブロックを作成して追加
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x00cc00 });
    const newBlock = new THREE.Mesh(geometry, grassMaterial);
    newBlock.position.copy(blockPos);
    scene.add(newBlock);
  }
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// リサイズ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
