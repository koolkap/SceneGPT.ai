import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { planetConfigs, sunConfig } from '../config/planets.js';
import { createHudOverlay } from './hudOverlay.js';

export function createSolarSystemScene({ canvas, hud }) {
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  const textureLoader = new THREE.TextureLoader();
  const screenPosition = new THREE.Vector3();
  const hudOverlay = createHudOverlay(hud);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(-26, 18, 34);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.minDistance = 10;
  controls.maxDistance = 120;
  controls.target.set(0, 2, 0);
  controls.update();

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.75, 0.9, 0.18));

  const ambientLight = new THREE.AmbientLight(0x5b6d91, 0.24);
  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffb347, 3.8, 300, 1.5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  scene.add(sunLight);

  const systems = [];
  const disposables = [];
  let running = false;
  let frameId = 0;

  function loadTexture(url, srgb = true) {
    if (!url) return null;
    const texture = textureLoader.load(url);
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return texture;
  }

  function registerDisposable(resource) {
    if (resource) disposables.push(resource);
    return resource;
  }

  function createStarfield() {
    const count = 4000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = 350 + Math.random() * 850;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const index = i * 3;

      positions[index] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index + 1] = radius * Math.cos(phi);
      positions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = registerDisposable(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = registerDisposable(new THREE.PointsMaterial({
      color: 0xdbe8ff,
      size: 1.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    }));

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  }

  function createSun() {
    const geometry = registerDisposable(new THREE.SphereGeometry(sunConfig.radius, 64, 64));
    const sunMap = loadTexture(sunConfig.map);
    const material = registerDisposable(new THREE.MeshStandardMaterial({
      map: sunMap,
      emissive: new THREE.Color(0xffb347),
      emissiveMap: sunMap,
      emissiveIntensity: 2.6,
      roughness: 0.7,
      metalness: 0
    }));

    const sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    const glowGeometry = registerDisposable(new THREE.SphereGeometry(sunConfig.radius * 1.18, 48, 48));
    const glowMaterial = registerDisposable(new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      opacity: 0.18
    }));
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
  }

  function createOrbitLine(radius) {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
    const points2D = curve.getPoints(180);
    const points = points2D.map((point) => new THREE.Vector3(point.x, 0, point.y));
    const geometry = registerDisposable(new THREE.BufferGeometry().setFromPoints(points));
    const material = registerDisposable(new THREE.LineBasicMaterial({
      color: 0x32405c,
      transparent: true,
      opacity: 0.5
    }));
    const line = new THREE.LineLoop(geometry, material);
    scene.add(line);
  }

  function createPlanet(config, index) {
    const pivot = new THREE.Group();
    scene.add(pivot);

    const geometry = registerDisposable(new THREE.SphereGeometry(config.radius, 48, 48));
    const material = registerDisposable(new THREE.MeshStandardMaterial({
      map: loadTexture(config.map),
      bumpMap: loadTexture(config.bump, false),
      bumpScale: config.bumpScale || 0,
      color: config.color || '#ffffff',
      roughness: 1,
      metalness: 0
    }));

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = config.orbitRadius;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);

    createOrbitLine(config.orbitRadius);

    systems.push({
      id: `planet-${index}`,
      name: config.name,
      distanceText: config.distanceText,
      orbitSpeed: config.orbitSpeed,
      rotationSpeed: config.rotationSpeed,
      pivot,
      mesh,
      angle: Math.random() * Math.PI * 2
    });
  }

  function createFallbackOuterPlanets() {
    const extras = [
      { name: 'Jupiter', radius: 2.1, orbitRadius: 25, orbitSpeed: 0.42, rotationSpeed: 1.9, distanceText: '778.5M km', color: '#d9b38c' },
      { name: 'Saturn', radius: 1.78, orbitRadius: 32, orbitSpeed: 0.31, rotationSpeed: 1.7, distanceText: '1.43B km', color: '#d8c089' },
      { name: 'Uranus', radius: 1.4, orbitRadius: 39, orbitSpeed: 0.22, rotationSpeed: 1.25, distanceText: '2.87B km', color: '#9ed8de' },
      { name: 'Neptune', radius: 1.34, orbitRadius: 46, orbitSpeed: 0.17, rotationSpeed: 1.32, distanceText: '4.50B km', color: '#537dff' }
    ];

    extras.forEach((config, index) => {
      const pivot = new THREE.Group();
      scene.add(pivot);

      const geometry = registerDisposable(new THREE.SphereGeometry(config.radius, 48, 48));
      const material = registerDisposable(new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 1,
        metalness: 0
      }));

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = config.orbitRadius;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      pivot.add(mesh);

      if (config.name === 'Saturn') {
        const ringGeometry = registerDisposable(new THREE.RingGeometry(config.radius * 1.35, config.radius * 2.25, 96));
        const ringMaterial = registerDisposable(new THREE.MeshBasicMaterial({
          color: 0xc9b07a,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        }));
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI * 0.38;
        mesh.add(ring);
      }

      createOrbitLine(config.orbitRadius);

      systems.push({
        id: `outer-${index}`,
        name: config.name,
        distanceText: config.distanceText,
        orbitSpeed: config.orbitSpeed,
        rotationSpeed: config.rotationSpeed,
        pivot,
        mesh,
        angle: Math.random() * Math.PI * 2
      });
    });
  }

  function createAsteroidBelt() {
    const count = 1500;
    const geometry = registerDisposable(new THREE.IcosahedronGeometry(0.08, 0));
    const material = registerDisposable(new THREE.MeshStandardMaterial({
      color: 0x7f7568,
      roughness: 1,
      metalness: 0
    }));

    const instanced = new THREE.InstancedMesh(geometry, material, count);
    instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20.5 + Math.random() * 3.8;
      const height = (Math.random() - 0.5) * 0.8;
      const scale = 0.4 + Math.random() * 1.4;

      dummy.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }

    scene.add(instanced);
  }

  function buildScene() {
    createStarfield();
    createSun();
    planetConfigs.forEach(createPlanet);

    const names = new Set(planetConfigs.map((item) => item.name));
    if (!names.has('Jupiter') || !names.has('Saturn') || !names.has('Uranus') || !names.has('Neptune')) {
      createFallbackOuterPlanets();
    }

    createAsteroidBelt();
  }

  function updateLabels() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    systems.forEach((planet) => {
      screenPosition.copy(planet.mesh.getWorldPosition(new THREE.Vector3()));
      screenPosition.y += planet.mesh.geometry.parameters.radius * 1.5;
      screenPosition.project(camera);

      const visible = screenPosition.z < 1 && screenPosition.z > -1;
      const x = (screenPosition.x * 0.5 + 0.5) * width;
      const y = (-screenPosition.y * 0.5 + 0.5) * height;

      hudOverlay.updateLabel(planet.id, {
        x,
        y,
        visible,
        name: planet.name,
        meta: `Distance: ${planet.distanceText}<br>Orbit: ${planet.orbitSpeed.toFixed(2)}x`
      });
    });
  }

  function updatePlanets(delta, elapsed) {
    systems.forEach((planet, index) => {
      planet.angle += delta * planet.orbitSpeed * 0.22;
      planet.pivot.rotation.y = planet.angle;
      planet.mesh.rotation.y += delta * planet.rotationSpeed * 0.7;
      planet.mesh.position.y = Math.sin(elapsed * 0.45 + index * 0.8) * 0.08;
    });
  }

  function animate() {
    if (!running) return;

    frameId = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.033);
    const elapsed = clock.elapsedTime;

    updatePlanets(delta, elapsed);
    controls.update();
    updateLabels();
    composer.render();
  }

  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  }

  function start() {
    if (running) return;
    buildScene();
    running = true;
    clock.start();
    onResize();
    window.addEventListener('resize', onResize);
    animate();
  }

  function dispose() {
    running = false;
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    hudOverlay.clear();
    disposables.forEach((resource) => {
      if (typeof resource.dispose === 'function') resource.dispose();
    });
    renderer.dispose();
  }

  return {
    start,
    dispose
  };
}
