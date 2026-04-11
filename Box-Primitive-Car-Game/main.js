import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const app = document.getElementById('app');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const bestKey = 'box-car-dodge-best';

function createSafeStorage() {
  try {
    const storage = window.localStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    const memoryStore = new Map();
    return {
      getItem(key) {
        return memoryStore.has(key) ? memoryStore.get(key) : null;
      },
      setItem(key, value) {
        memoryStore.set(key, String(value));
      },
      removeItem(key) {
        memoryStore.delete(key);
      },
    };
  }
}

const storage = createSafeStorage();
let bestScore = Number(storage.getItem(bestKey) || 0);
bestEl.textContent = String(bestScore);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
app.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b6ff);
scene.fog = new THREE.Fog(0x87b6ff, 20, 90);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 8, 12);
camera.lookAt(0, 0, -8);

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(8, 18, 10);
sun.castShadow = true;
scene.add(sun);

const roadWidth = 12;
const laneCount = 3;
const laneWidth = roadWidth / laneCount;
const laneCenters = [-laneWidth, 0, laneWidth];

const world = new THREE.Group();
scene.add(world);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 180),
  new THREE.MeshStandardMaterial({ color: 0x3f7c40 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.BoxGeometry(roadWidth, 0.1, 180),
  new THREE.MeshStandardMaterial({ color: 0x23272f })
);
road.position.set(0, 0, -30);
road.receiveShadow = true;
world.add(road);

const laneMarkers = [];
for (let i = 0; i < 24; i++) {
  for (let lane = 1; lane < laneCount; lane++) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.02, 3),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x222222 })
    );
    marker.position.set(-roadWidth / 2 + lane * laneWidth, 0.08, -i * 8);
    marker.receiveShadow = true;
    world.add(marker);
    laneMarkers.push(marker);
  }
}

function createCar(color = 0xff4444) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 3.2),
    new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.8 })
  );
  body.position.y = 0.7;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.6, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.2, roughness: 0.4 })
  );
  cabin.position.set(0, 1.2, -0.1);
  cabin.castShadow = true;
  group.add(cabin);

  const wheelGeometry = new THREE.BoxGeometry(0.35, 0.45, 0.75);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const wheelOffsets = [
    [-0.95, 0.3, 1.05],
    [0.95, 0.3, 1.05],
    [-0.95, 0.3, -1.05],
    [0.95, 0.3, -1.05],
  ];

  wheelOffsets.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

const playerCar = createCar(0x22c55e);
playerCar.position.set(laneCenters[1], 0, 4);
world.add(playerCar);

const obstacleColors = [0xef4444, 0xf59e0b, 0x3b82f6, 0xa855f7, 0xe11d48];
const obstacles = [];

function spawnObstacle(z = -70) {
  const lane = Math.floor(Math.random() * laneCount);
  const car = createCar(obstacleColors[Math.floor(Math.random() * obstacleColors.length)]);
  car.position.set(laneCenters[lane], 0, z);
  world.add(car);
  obstacles.push({ mesh: car, lane });
}

for (let i = 0; i < 6; i++) {
  spawnObstacle(-25 - i * 18);
}

let score = 0;
let gameOver = false;
let targetLane = 1;
let speed = 18;
let lastTime = 0;
let roadOffset = 0;

const input = {
  left: false,
  right: false,
};

function updateScore(value) {
  score = value;
  scoreEl.textContent = String(Math.floor(score));

  if (score > bestScore) {
    bestScore = Math.floor(score);
    bestEl.textContent = String(bestScore);
    storage.setItem(bestKey, String(bestScore));
  }
}

function setLane(index) {
  targetLane = Math.max(0, Math.min(laneCount - 1, index));
}

function moveLeft() {
  if (gameOver) return;
  setLane(targetLane - 1);
}

function moveRight() {
  if (gameOver) return;
  setLane(targetLane + 1);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    input.left = true;
    moveLeft();
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    input.right = true;
    moveRight();
  }
  if (event.key === ' ' && gameOver) {
    restartGame();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.left = false;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.right = false;
});

function bindHold(button, onPress) {
  const start = (event) => {
    event.preventDefault();
    onPress();
  };
  button.addEventListener('pointerdown', start);
  button.addEventListener('touchstart', start, { passive: false });
}

bindHold(leftBtn, moveLeft);
bindHold(rightBtn, moveRight);
restartBtn.addEventListener('click', restartGame);

overlay.classList.add('hidden');

function getBounds(mesh) {
  return new THREE.Box3().setFromObject(mesh);
}

function endGame() {
  gameOver = true;
  overlay.classList.remove('hidden');
}

function restartGame() {
  gameOver = false;
  overlay.classList.add('hidden');
  updateScore(0);
  speed = 18;
  targetLane = 1;
  playerCar.position.set(laneCenters[1], 0, 4);

  obstacles.forEach((obstacle, index) => {
    obstacle.lane = Math.floor(Math.random() * laneCount);
    obstacle.mesh.position.set(laneCenters[obstacle.lane], 0, -25 - index * 18);
  });
}

function updateObstacles(delta) {
  const playerBounds = getBounds(playerCar);

  obstacles.forEach((obstacle) => {
    obstacle.mesh.position.z += speed * delta;
    obstacle.mesh.rotation.y = Math.PI;

    if (obstacle.mesh.position.z > 16) {
      obstacle.lane = Math.floor(Math.random() * laneCount);
      obstacle.mesh.position.z = -90 - Math.random() * 40;
      obstacle.mesh.position.x = laneCenters[obstacle.lane];
      updateScore(score + 10);
      speed = Math.min(speed + 0.35, 42);
    }

    const obstacleBounds = getBounds(obstacle.mesh);
    if (playerBounds.intersectsBox(obstacleBounds)) {
      endGame();
    }
  });
}

function updatePlayer(delta) {
  const targetX = laneCenters[targetLane];
  playerCar.position.x = THREE.MathUtils.lerp(playerCar.position.x, targetX, delta * 10);
  const offset = targetX - playerCar.position.x;
  playerCar.rotation.z = -offset * 0.12;
}

function updateRoad(delta) {
  roadOffset += speed * delta;
  laneMarkers.forEach((marker) => {
    marker.position.z = ((marker.position.z + roadOffset + 80) % 80) - 80;
  });
  roadOffset = 0;
}

function updateCamera() {
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerCar.position.x * 0.35, 0.08);
  camera.lookAt(playerCar.position.x * 0.2, 0.8, -8);
}

function animate(time) {
  const delta = Math.min((time - lastTime) / 1000 || 0, 0.033);
  lastTime = time;

  if (!gameOver) {
    updatePlayer(delta);
    updateRoad(delta);
    updateObstacles(delta);
  }

  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateScore(0);
requestAnimationFrame(animate);
