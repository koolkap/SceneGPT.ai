import { createVideoFlow } from './systems/videoFlow.js';
import { createSolarSystemScene } from './systems/solarSystemScene.js';

const intro = document.getElementById('intro');
const videoScreen = document.getElementById('video-screen');
const video = document.getElementById('intro-video');
const skipButton = document.getElementById('skip-button');
const fadeOverlay = document.getElementById('fade-overlay');
const hud = document.getElementById('hud');
const canvas = document.getElementById('scene-canvas');

const INTRO_VIDEO_URL = 'http://localhost:8000/api/v1/assets/uploads/1c9cb115-8e1a-49f0-a92d-5db6d95b350d/file/solar-system.mp4';

let sceneApp = null;
let sceneStarted = false;

function startScene() {
  if (sceneStarted) return;
  sceneStarted = true;

  hud.classList.remove('hidden');
  sceneApp = createSolarSystemScene({ canvas, hud });
  sceneApp.start();
}

const flow = createVideoFlow({
  intro,
  videoScreen,
  video,
  skipButton,
  fadeOverlay,
  videoUrl: INTRO_VIDEO_URL,
  onSimulationStart: startScene
});

flow.init();

window.addEventListener('beforeunload', () => {
  if (sceneApp) sceneApp.dispose();
});
