export const sunConfig = {
  radius: 4.2,
  map: 'http://localhost:8000/api/v1/assets/uploads/cb46b5f6-c6a4-40d2-af29-0c191eac6ac2/file/sunmap.jpg'
};

export const planetConfigs = [
  {
    name: 'Mercury',
    radius: 0.55,
    orbitRadius: 8,
    orbitSpeed: 1.45,
    rotationSpeed: 0.7,
    distanceText: '57.9M km',
    map: 'http://localhost:8000/api/v1/assets/uploads/b57a0b58-b9fa-4502-a2db-d5ce5a49db98/file/mercurymapthumb.jpg',
    bump: 'http://localhost:8000/api/v1/assets/uploads/a026215e-8153-4e40-b042-24ab4e454401/file/mercurybumpthumb.jpg',
    bumpScale: 0.08,
    color: '#a6a7ab'
  },
  {
    name: 'Venus',
    radius: 0.9,
    orbitRadius: 11,
    orbitSpeed: 1.12,
    rotationSpeed: 0.22,
    distanceText: '108.2M km',
    map: 'http://localhost:8000/api/v1/assets/uploads/5d1654ff-5e42-4d57-aa76-1c4c9a9a6d8a/file/venusmapthumb.jpg',
    bump: 'http://localhost:8000/api/v1/assets/uploads/e0371857-5e32-407c-af30-c11d6063214e/file/venusbumpthumb.jpg',
    bumpScale: 0.04,
    color: '#d9a65f'
  },
  {
    name: 'Earth',
    radius: 0.96,
    orbitRadius: 14.5,
    orbitSpeed: 0.92,
    rotationSpeed: 1.4,
    distanceText: '149.6M km',
    map: 'http://localhost:8000/api/v1/assets/uploads/a47c3b51-a351-4f18-b557-8034d627877c/file/earthmapthumb.jpg',
    bump: 'http://localhost:8000/api/v1/assets/uploads/279abced-fbe2-4874-818d-a131f96192d0/file/earthbumpthumb.jpg',
    bumpScale: 0.05,
    color: '#54a4ff'
  },
  {
    name: 'Mars',
    radius: 0.72,
    orbitRadius: 18.2,
    orbitSpeed: 0.74,
    rotationSpeed: 1.18,
    distanceText: '227.9M km',
    map: 'http://localhost:8000/api/v1/assets/uploads/38430d24-faab-44a1-8a62-d279d7c0f1a8/file/marsmapthumb.jpg',
    bump: 'http://localhost:8000/api/v1/assets/uploads/6a8a3feb-08c0-45a8-add3-5524b2086c3c/file/marsbumpthumb.jpg',
    bumpScale: 0.05,
    color: '#d16c43'
  },
  {
    name: 'Jupiter',
    radius: 2.2,
    orbitRadius: 26,
    orbitSpeed: 0.32,
    rotationSpeed: 2.1,
    distanceText: '778.5M km',
    color: '#d6b089'
  },
  {
    name: 'Saturn',
    radius: 1.9,
    orbitRadius: 34,
    orbitSpeed: 0.21,
    rotationSpeed: 1.8,
    distanceText: '1.43B km',
    color: '#d9c58a',
    hasRing: true
  },
  {
    name: 'Uranus',
    radius: 1.45,
    orbitRadius: 41.5,
    orbitSpeed: 0.14,
    rotationSpeed: 1.25,
    distanceText: '2.87B km',
    color: '#8ed6e8'
  },
  {
    name: 'Neptune',
    radius: 1.4,
    orbitRadius: 48,
    orbitSpeed: 0.11,
    rotationSpeed: 1.18,
    distanceText: '4.50B km',
    color: '#497dff'
  }
];
