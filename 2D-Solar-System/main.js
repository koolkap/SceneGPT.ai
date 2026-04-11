const app = document.getElementById('app');

const planets = [
  { name: 'Mercury', orbit: 120, size: 10, speed: 8, className: 'mercury' },
  { name: 'Venus', orbit: 160, size: 14, speed: 12, className: 'venus' },
  { name: 'Earth', orbit: 210, size: 16, speed: 16, className: 'earth' },
  { name: 'Mars', orbit: 255, size: 12, speed: 20, className: 'mars' },
  { name: 'Jupiter', orbit: 320, size: 28, speed: 28, className: 'jupiter' },
  { name: 'Saturn', orbit: 390, size: 24, speed: 36, className: 'saturn' },
  { name: 'Uranus', orbit: 455, size: 18, speed: 44, className: 'uranus' },
  { name: 'Neptune', orbit: 520, size: 18, speed: 54, className: 'neptune' }
];

function createPlanetSystem(planet, index) {
  return `
    <div class="orbit" style="width:${planet.orbit * 2}px;height:${planet.orbit * 2}px;"></div>
    <div class="planet-system" style="animation-duration:${planet.speed}s; animation-delay:-${index * 0.8}s;">
      <div class="planet ${planet.className}" style="width:${planet.size}px;height:${planet.size}px;margin-left:${planet.orbit}px;"></div>
      <div class="label" style="margin-left:${planet.orbit + planet.size + 10}px;">${planet.name}</div>
    </div>
  `;
}

if (app) {
  app.innerHTML = `
    <div class="solar-ui">
      <h1>Primitive Solar System</h1>
      <p>Animated planets orbiting a glowing sun using simple HTML and CSS primitives.</p>
    </div>
    <div class="space">
      <div class="sun"></div>
      ${planets.map(createPlanetSystem).join('')}
    </div>
  `;
}