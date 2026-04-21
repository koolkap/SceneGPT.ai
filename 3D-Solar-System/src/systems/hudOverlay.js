export function createHudOverlay(container) {
  const labels = new Map();

  function ensureLabel(id, data) {
    let entry = labels.get(id);

    if (!entry) {
      const el = document.createElement('div');
      el.className = 'planet-label';
      el.innerHTML = `
        <span class="planet-label__name"></span>
        <span class="planet-label__meta"></span>
      `;
      container.appendChild(el);
      entry = {
        el,
        name: el.querySelector('.planet-label__name'),
        meta: el.querySelector('.planet-label__meta')
      };
      labels.set(id, entry);
    }

    if (data.name) entry.name.textContent = data.name;
    if (data.meta) entry.meta.innerHTML = data.meta;

    return entry;
  }

  function updateLabel(id, data) {
    const entry = ensureLabel(id, data);
    const { x, y, visible = true } = data;

    entry.el.style.left = `${x}px`;
    entry.el.style.top = `${y}px`;
    entry.el.style.opacity = visible ? '1' : '0';
    entry.el.style.display = visible ? 'block' : 'none';
  }

  function removeLabel(id) {
    const entry = labels.get(id);
    if (!entry) return;
    entry.el.remove();
    labels.delete(id);
  }

  function clear() {
    labels.forEach(({ el }) => el.remove());
    labels.clear();
  }

  return {
    updateLabel,
    removeLabel,
    clear
  };
}
