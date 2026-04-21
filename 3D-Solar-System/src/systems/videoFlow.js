export function createVideoFlow({ intro, videoScreen, video, skipButton, fadeOverlay, videoUrl, onSimulationStart }) {
  let locked = false;
  let started = false;

  function show(el) {
    el.classList.remove('hidden');
    el.classList.add('visible');
  }

  function hide(el) {
    el.classList.remove('visible');
    el.classList.add('hidden');
  }

  function fadeIn() {
    fadeOverlay.classList.add('active');
  }

  function fadeOut() {
    requestAnimationFrame(() => fadeOverlay.classList.remove('active'));
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function startSimulation() {
    if (started) return;
    started = true;
    locked = true;

    fadeIn();
    await wait(700);
    hide(videoScreen);
    hide(intro);
    video.pause();
    onSimulationStart();
    await wait(120);
    fadeOut();
    locked = false;
  }

  async function playIntroVideo() {
    if (locked || started) return;
    locked = true;

    fadeIn();
    await wait(650);
    hide(intro);
    show(videoScreen);
    video.currentTime = 0;
    video.muted = true;
    video.playsInline = true;

    try {
      await video.play();
    } catch (_) {
      await startSimulation();
      return;
    }

    await wait(120);
    fadeOut();
    locked = false;
  }

  function bindEvents() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') playIntroVideo();
    });

    skipButton.addEventListener('click', () => {
      if (locked || started) return;
      startSimulation();
    });

    video.addEventListener('ended', startSimulation);
    video.addEventListener('error', startSimulation);
  }

  function init() {
    video.src = videoUrl;
    video.autoplay = false;
    video.loop = false;
    video.controls = false;
    video.preload = 'metadata';
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    show(intro);
    hide(videoScreen);
    bindEvents();

    requestAnimationFrame(() => fadeOut());
  }

  return { init, startSimulation, playIntroVideo };
}