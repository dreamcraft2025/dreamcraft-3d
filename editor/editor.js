const stage = new Konva.Stage({
  container: 'stage-container',
 width: 3000,
  height: window.innerHeight
});


// Capa de fondo con rejilla
const gridLayer = new Konva.Layer();

// Crear líneas de rejilla
const gridSize = 50;
const width = stage.width();
const height = stage.height();

for (let i = 0; i < width; i += gridSize) {
  gridLayer.add(new Konva.Line({
    points: [i, 0, i, height],
    stroke: '#e0e0e0',
    strokeWidth: 1
  }));
}

for (let j = 0; j < height; j += gridSize) {
  gridLayer.add(new Konva.Line({
    points: [0, j, width, j],
    stroke: '#e0e0e0',
    strokeWidth: 1
  }));
}

// Agregar primero la rejilla al escenario
stage.add(gridLayer);



// --- INFINITE GRID CONFIG (MEJORADA) ---
function drawGrid() {
  gridLayer.destroyChildren();
  const viewPos = stage.position();
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  const extra = 2000; // Dibujar más allá de los bordes
  const startX = -extra - (viewPos.x % gridSize);
  const endX = stageWidth + extra;
  const startY = -extra - (viewPos.y % gridSize);
  const endY = stageHeight + extra;

  for (let x = startX; x < endX; x += gridSize) {
    gridLayer.add(new Konva.Line({
      points: [x, startY, x, endY],
      stroke: '#e0e0e0',
      strokeWidth: 1
    }));
  }

  for (let y = startY; y < endY; y += gridSize) {
    gridLayer.add(new Konva.Line({
      points: [startX, y, endX, y],
      stroke: '#e0e0e0',
      strokeWidth: 1
    }));
  }

  gridLayer.batchDraw();
}

stage.on('dragmove', drawGrid);
stage.draggable(true);
drawGrid();
// --- END INFINITE GRID CONFIG ---



const layer = new Konva.Layer();
stage.add(layer);

let selected = null;
let transformer = null;
let stickers = [];

// Crear muro
function createWall(x = 50, y = 50, width = 200, height = 15) {
  const wall = new Konva.Rect({
    x,
    y,
    width,
    height,
    fill: "#666666",
    draggable: true,
    name: 'wall'
  });

  wall.on('mouseover', () => {
    if (wall !== selected) wall.fill("#666666"); // gris oscuro
    layer.draw();
  });

  wall.on('mouseout', () => {
    if (wall !== selected) wall.fill("#666666"); // gris oscuro
    hideStickers();
    layer.draw();
  });
    wall.on('click', () => {
  selectObject(wall);
  document.getElementById('toolbar').classList.add('visible');
});

  wall.on('dragend transformend', () => {
    updateMeasurement();
    updateStickerPositions();
  });

  layer.add(wall);
  layer.draw();
  return wall;
}

// Añadir muro
document.getElementById('addWall').addEventListener('click', () => {
  const newWall = createWall();
  selectObject(newWall);
});

// Seleccionar objeto
function selectObject(obj) {
  selected = obj;

  document.getElementById('object-tools').classList.remove('hidden');
  document.getElementById('widthInput').value = Math.round(obj.height());
  document.getElementById('lengthInput').value = Math.round(obj.width());

  if (transformer) transformer.destroy();

  transformer = new Konva.Transformer({
    nodes: [obj],
    enabledAnchors: []
  });

  layer.add(transformer);
  layer.draw();

  showStickers(obj);
}

// Eliminar objeto
document.getElementById('deleteObject').addEventListener('click', () => {
  if (selected) {
    selected.destroy();
    if (transformer) transformer.destroy();
    hideStickers();
    selected = null;
    document.getElementById('object-tools').classList.add('hidden');
    layer.draw();
  }
});

// Rotar objeto
document.getElementById('rotateObject').addEventListener('click', () => {
  if (selected) {
    selected.rotate(90);
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  }
});

// Duplicar objeto
document.getElementById('duplicateObject').addEventListener('click', () => {
  if (selected) {
    const clone = selected.clone({
      x: selected.x() + 20,
      y: selected.y() + 20
    });
    layer.add(clone);
    selectObject(clone);
    layer.draw();
  }
});

// Inputs manuales de medidas
document.getElementById('widthInput').addEventListener('input', (e) => {
  if (selected) {
    selected.height(parseInt(e.target.value));
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  }
});

document.getElementById('lengthInput').addEventListener('input', (e) => {
  if (selected) {
    selected.width(parseInt(e.target.value));
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  }
});

// Mostrar medidas
function updateMeasurement() {
  if (!selected) return;

  const text = `${Math.round(selected.width())} cm x ${Math.round(selected.height())} cm`;

  if (!selected.measurementText) {
    const measurement = new Konva.Label({
      x: selected.x() + selected.width() + 5,
      y: selected.y() - 10
    });

    measurement.add(new Konva.Tag({
      fill: 'white',
      stroke: '#555',
      strokeWidth: 1,
      cornerRadius: 4
    }));

    measurement.add(new Konva.Text({
      text: text,
      fontSize: 12,
      padding: 4,
      fill: '#333'
    }));

    selected.measurementText = measurement;
    layer.add(measurement);
  } else {
    selected.measurementText.getText().text(text);
    selected.measurementText.position({
      x: selected.x() + selected.width() + 5,
      y: selected.y() - 10
    });
  }

  layer.draw();
}

// Stickers extremos para estirar
function showStickers(obj) {
  hideStickers();

  const leftSticker = new Konva.Circle({
    x: obj.x(),
    y: obj.y() + obj.height() / 2,
    radius: 6,
    fill: '#a67c52',
    draggable: true
  });

  const rightSticker = new Konva.Circle({
    x: obj.x() + obj.width(),
    y: obj.y() + obj.height() / 2,
    radius: 6,
    fill: '#a67c52',
    draggable: true
  });

  leftSticker.on('dragmove', () => {
    const newX = leftSticker.x();
    const newWidth = obj.x() + obj.width() - newX;
    obj.x(newX);
    obj.width(newWidth);
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  });

  rightSticker.on('dragmove', () => {
    const newWidth = rightSticker.x() - obj.x();
    obj.width(newWidth);
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  });

  stickers.push(leftSticker, rightSticker);
  layer.add(leftSticker, rightSticker);
  updateMeasurement();
  layer.draw();
}

function hideStickers() {
  stickers.forEach(s => s.destroy());
  stickers = [];

  if (selected && selected.measurementText) {
    selected.measurementText.destroy();
    selected.measurementText = null;
  }
  layer.draw();
}

function updateStickerPositions() {
  if (!selected || stickers.length < 2) return;

  stickers[0].position({
    x: selected.x(),
    y: selected.y() + selected.height() / 2
  });

  stickers[1].position({
    x: selected.x() + selected.width(),
    y: selected.y() + selected.height() / 2
  });
}
document.getElementById('close-toolbar').addEventListener('click', () => {
  document.getElementById('toolbar').classList.remove('visible');
  deselectObject();
});

// Función para desseleccionar
function deselectObject() {
  if (selected) {
    selected.stroke(null);
    selected = null;
    layer.draw();
  }
// Ocultar el panel si se hace clic fuera de un muro
stage.on('click', (e) => {
  if (!e.target.hasName('wall')) {
    deselectObject();
    document.getElementById('toolbar').classList.remove('visible');
    document.getElementById('object-tools').classList.add('hidden');
  }
});
}
// Ocultar el panel si se hace clic fuera del muro
stage.on('click', (e) => {
  if (e.target === stage || e.target === stage.findOne('Layer')) {
    if (transformer) transformer.destroy();
    hideStickers();
    selected = null;

    document.getElementById('object-tools').classList.add('hidden');
    document.getElementById('toolbar').classList.remove('visible');

    layer.draw();
  }
});







// === PANNING ===
let isPanning = false;
let lastDist = { x: 0, y: 0 };

stage.on('mousedown', (e) => {
  // Solo iniciar panning si no se ha hecho clic sobre un objeto Konva
  if (e.target === stage) {
    isPanning = true;
    const pos = stage.getPointerPosition();
    lastDist = { x: pos.x, y: pos.y };
  }
});

stage.on('mousemove', (e) => {
  if (!isPanning) return;
  const pos = stage.getPointerPosition();
  const dx = pos.x - lastDist.x;
  const dy = pos.y - lastDist.y;
  lastDist = pos;
  const oldPos = stage.position();
  stage.position({
    x: oldPos.x + dx,
    y: oldPos.y + dy
  });
  stage.batchDraw();
});

stage.on('mouseup', () => {
  isPanning = false;
});

// === ZOOM ===
stage.on('wheel', (e) => {
  e.evt.preventDefault();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  const scaleBy = 1.05;
  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  // Limitar zoom entre 0.2x y 5x
  const limitedScale = newScale; // Zoom libre, sin límites

  stage.scale({ x: limitedScale, y: limitedScale });

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale
  };

  const newPos = {
    x: pointer.x - mousePointTo.x * limitedScale,
    y: pointer.y - mousePointTo.y * limitedScale
  };

  stage.position(newPos);
  stage.batchDraw();
});



// --- Unión automática de muros --- //
function areEndsClose(rect1, rect2, threshold = 10) {
  const ends1 = [
    { x: rect1.x(), y: rect1.y() },
    { x: rect1.x() + rect1.width(), y: rect1.y() + rect1.height() }
  ];
  const ends2 = [
    { x: rect2.x(), y: rect2.y() },
    { x: rect2.x() + rect2.width(), y: rect2.y() + rect2.height() }
  ];
  for (let p1 of ends1) {
    for (let p2 of ends2) {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        return { match: true, p1, p2 };
      }
    }
  }
  return { match: false };
}

const guideLayer = new Konva.Layer();
stage.add(guideLayer);

function showGuide(p1, p2) {
  guideLayer.destroyChildren();
  const line = new Konva.Line({
    points: [p1.x, p1.y, p2.x, p2.y],
    stroke: 'red',
    strokeWidth: 2,
    dash: [4, 4]
  });
  guideLayer.add(line);
  guideLayer.batchDraw();
}

function clearGuide() {
  guideLayer.destroyChildren();
  guideLayer.batchDraw();
}

// Hookear muros existentes
function hookWallEvents(wall, allWalls) {
  wall.on('dragmove', () => {
    clearGuide();
    for (let other of allWalls) {
      if (other === wall) continue;
      const { match, p1, p2 } = areEndsClose(wall, other);
      if (match) {
        wall.position({
          x: wall.x() + (p2.x - p1.x),
          y: wall.y() + (p2.y - p1.y)
        });
        wall.getLayer().batchDraw();
        showGuide(p1, p2);
        break;
      }
    }
  });

  wall.on('dragend', () => {
    clearGuide();
  });
}

// Aplicar a todos los muros
function hookAllWalls() {
  const walls = stage.find('.wall');
  walls.forEach(w => hookWallEvents(w, walls));
}

stage.on('contentReady', hookAllWalls); // Evento personalizado si se requiere
setTimeout(hookAllWalls, 1000); // fallback inicial
