const stage = new Konva.Stage({
  container: 'stage-container',
 width: 3000,
  height: window.innerHeight
});


// CUADRÍCULA DE FONDO
const gridLayer = new Konva.Layer();
const gridSize = 50;

for (let i = 0; i < stage.width() / gridSize; i++) {
  gridLayer.add(new Konva.Line({
    points: [i * gridSize, 0, i * gridSize, stage.height()],
    stroke: '#ddd',
    strokeWidth: 1,
  }));
}

for (let j = 0; j < stage.height() / gridSize; j++) {
  gridLayer.add(new Konva.Line({
    points: [0, j * gridSize, stage.width(), j * gridSize],
    stroke: '#ddd',
    strokeWidth: 1,
  }));
}

stage.add(gridLayer);
gridLayer.moveToBottom();

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






// SLIDER DE ZOOM
document.getElementById('zoomSlider').addEventListener('input', function (e) {
  const scale = parseFloat(e.target.value);
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };
  stage.scale({ x: scale, y: scale });
  const newPos = {
    x: pointer.x - mousePointTo.x * scale,
    y: pointer.y - mousePointTo.y * scale,
  };
  stage.position(newPos);
  stage.batchDraw();
});


// === ZOOM Y DESPLAZAMIENTO FUNCIONALES ===
let scaleBy = 1.05;

// ZOOM CON RUEDA
stage.on('wheel', (e) => {
  e.evt.preventDefault();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };
  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
  stage.batchDraw();

  // Actualizar el slider
  const slider = document.getElementById('zoomSlider');
  if (slider) slider.value = newScale.toFixed(2);
});

// ZOOM CON SLIDER
document.getElementById('zoomSlider').addEventListener('input', function (e) {
  const scale = parseFloat(e.target.value);
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };
  stage.scale({ x: scale, y: scale });
  const newPos = {
    x: pointer.x - mousePointTo.x * scale,
    y: pointer.y - mousePointTo.y * scale,
  };
  stage.position(newPos);
  stage.batchDraw();
});

// DRAG DEL STAGE
let isPanning = false;
let lastPanPos = null;

stage.on('mousedown touchstart', (e) => {
  if (e.target === stage || e.target.getClassName() === 'Layer') {
    isPanning = true;
    lastPanPos = stage.getPointerPosition();
  }
});

stage.on('mousemove touchmove', (e) => {
  if (isPanning) {
    const pos = stage.getPointerPosition();
    const dx = pos.x - lastPanPos.x;
    const dy = pos.y - lastPanPos.y;

    stage.x(stage.x() + dx);
    stage.y(stage.y() + dy);
    stage.batchDraw();
    lastPanPos = pos;
  }
});

stage.on('mouseup touchend', () => {
  isPanning = false;
});
