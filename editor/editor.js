const stage = new Konva.Stage({
  container: 'stage-container',
  width: window.innerWidth - 220,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

let selected = null;
let measureLabel = null;
let transformer = null;
let stickerLeft = null;
let stickerRight = null;

// Crea un muro
function createWall(x = 50, y = 50, width = 200, height = 15) {
  const wall = new Konva.Rect({
    x,
    y,
    width,
    height,
    fill: '#6b4c2b',
    draggable: true,
    name: 'wall',
  });

  // Eventos de hover
  wall.on('mouseover', () => {
    wall.fill('#8b5e3c');
    layer.draw();
    showStickers(wall);
  });

  wall.on('mouseout', () => {
    if (wall !== selected) wall.fill('#6b4c2b');
    hideStickers();
    layer.draw();
  });

  wall.on('click', () => {
    selectObject(wall);
  });

  wall.on('dragend transformend', () => {
    updateMeasurement();
    updateStickerPositions();
  });

  layer.add(wall);
  layer.draw();
  return wall;
}

// Añadir nuevo muro
document.getElementById('addWall').addEventListener('click', () => {
  const newWall = createWall();
  selectObject(newWall);
});

// Seleccionar muro
function selectObject(obj) {
  selected = obj;

  document.getElementById('object-tools').classList.remove('hidden');
  document.getElementById('widthInput').value = Math.round(obj.height());
  document.getElementById('lengthInput').value = Math.round(obj.width());

  // Quitar transformer anterior
  if (transformer) transformer.destroy();

  // Crear transformer solo para mover
  transformer = new Konva.Transformer({
    nodes: [obj],
    enabledAnchors: [],
  });

  layer.add(transformer);
  layer.draw();

  updateMeasurement();
  updateStickerPositions();

  // Input de ancho
  document.getElementById('widthInput').oninput = (e) => {
    const newHeight = parseInt(e.target.value);
    if (!isNaN(newHeight)) {
      obj.height(newHeight);
      layer.draw();
      updateMeasurement();
    }
  };

  // Input de largo
  document.getElementById('lengthInput').oninput = (e) => {
    const newWidth = parseInt(e.target.value);
    if (!isNaN(newWidth)) {
      obj.width(newWidth);
      layer.draw();
      updateMeasurement();
      updateStickerPositions();
    }
  };
}

// Botón eliminar
document.getElementById('deleteObject').addEventListener('click', () => {
  if (selected) {
    selected.destroy();
    transformer.destroy();
    hideStickers();
    if (measureLabel) measureLabel.remove();
    selected = null;
    document.getElementById('object-tools').classList.add('hidden');
    layer.draw();
  }
});

// Botón rotar
document.getElementById('rotateObject').addEventListener('click', () => {
  if (selected) {
    selected.rotation((selected.rotation() + 90) % 360);
    layer.draw();
    updateMeasurement();
    updateStickerPositions();
  }
});

// Botón duplicar
document.getElementById('duplicateObject').addEventListener('click', () => {
  if (selected) {
    const clone = createWall(
      selected.x() + 20,
      selected.y() + 20,
      selected.width(),
      selected.height()
    );
    selectObject(clone);
  }
});

// Actualizar etiqueta de medidas
function updateMeasurement() {
  if (!selected) return;

  const width = Math.round(selected.width());
  const height = Math.round(selected.height());

  if (!measureLabel) {
    measureLabel = document.createElement('div');
    measureLabel.className = 'measure-label';
    document.body.appendChild(measureLabel);
  }

  const pos = selected.getClientRect();
  measureLabel.innerText = `${width} cm x ${height} cm`;
  measureLabel.style.left = `${pos.x + 230}px`;
  measureLabel.style.top = `${pos.y + 10}px`;
}

// Mostrar y posicionar stickers
function showStickers(wall) {
  hideStickers(); // eliminar anteriores

  const x = wall.x();
  const y = wall.y();
  const width = wall.width();
  const height = wall.height();

  // Izquierda
  stickerLeft = new Konva.Circle({
    x: x,
    y: y + height / 2,
    radius: 6,
    fill: '#3e3e3e',
    draggable: true
  });

  stickerLeft.on('dragmove', () => {
    const dx = wall.x() - stickerLeft.x();
    wall.x(stickerLeft.x());
    wall.width(wall.width() + dx);
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  });

  // Derecha
  stickerRight = new Konva.Circle({
    x: x + width,
    y: y + height / 2,
    radius: 6,
    fill: '#3e3e3e',
    draggable: true
  });

  stickerRight.on('dragmove', () => {
    const newWidth = stickerRight.x() - wall.x();
    wall.width(newWidth);
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  });

  layer.add(stickerLeft);
  layer.add(stickerRight);
  layer.draw();
}

// Ocultar stickers
function hideStickers() {
  if (stickerLeft) {
    stickerLeft.destroy();
    stickerLeft = null;
  }
  if (stickerRight) {
    stickerRight.destroy();
    stickerRight = null;
  }
  layer.draw();
}

// Reposicionar los stickers después de cambio
function updateStickerPositions() {
  if (!selected || !stickerLeft || !stickerRight) return;
  const x = selected.x();
  const y = selected.y();
  const width = selected.width();
  const height = selected.height();
  stickerLeft.position({ x: x, y: y + height / 2 });
  stickerRight.position({ x: x + width, y: y + height / 2 });
}
