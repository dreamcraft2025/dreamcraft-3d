const stage = new Konva.Stage({
  container: 'stage-container',
 width: 3000,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

let selected = null;
let transformer = null;
let stickers = [];

// Crear muro
// Crear muro con texto de medida
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

  const labelBg = new Konva.Rect({
    width: 80,
    height: 24,
    fill: 'white',
    cornerRadius: 4,
    shadowBlur: 5,
    shadowColor: 'black',
    opacity: 0.8,
    name: 'label-bg'
  });

  const label = new Konva.Text({
    text: `${Math.round(width)}x${Math.round(height)} cm`,
    fontSize: 14,
    fill: '#333',
    fontStyle: 'bold',
    align: 'center',
    verticalAlign: 'middle',
    width: 80,
    height: 24,
    padding: 4,
    name: 'label'
  });

  function updateLabelPosition() {
    const centerX = wall.x() + wall.width() / 2;
    const centerY = wall.y() + wall.height() / 2;

    labelBg.x(centerX - labelBg.width() / 2);
    labelBg.y(centerY - labelBg.height() / 2);

    label.x(centerX - label.width() / 2);
    label.y(centerY - label.height() / 2);

    label.text(`${Math.round(wall.width())}x${Math.round(wall.height())} cm`);
  }

  wall.on('dragmove transform move transformend transform', updateLabelPosition);
  wall.on('transformend', updateLabelPosition);
  wall.on('dragend', updateLabelPosition);

  wall.on('click', () => {
    selectObject(wall);
    document.getElementById('toolbar').classList.add('visible');
  });

  layer.add(wall);
  layer.add(labelBg);
  layer.add(label);
  updateLabelPosition();
  layer.draw();

  // Asociar los elementos al muro para uso posterior
  wall._label = label;
  wall._labelBg = labelBg;

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

  document.getElementById('widthInput').oninput = (e) => {
    obj.height(parseFloat(e.target.value));
    if (obj._label) obj._label.text(`${Math.round(obj.width())}x${Math.round(obj.height())} cm`);
    if (obj._label && obj._labelBg) updateLabelPositionFor(obj);
    layer.draw();
  };

  document.getElementById('lengthInput').oninput = (e) => {
    obj.width(parseFloat(e.target.value));
    if (obj._label) obj._label.text(`${Math.round(obj.width())}x${Math.round(obj.height())} cm`);
    if (obj._label && obj._labelBg) updateLabelPositionFor(obj);
    layer.draw();
  };

  if (transformer) transformer.destroy();

  transformer = new Konva.Transformer({
    nodes: [obj]
  });
  layer.add(transformer);
  layer.draw();
}
function updateLabelPositionFor(wall) {
  const centerX = wall.x() + wall.width() / 2;
  const centerY = wall.y() + wall.height() / 2;
  wall._label.x(centerX - wall._label.width() / 2);
  wall._label.y(centerY - wall._label.height() / 2);
  wall._labelBg.x(centerX - wall._labelBg.width() / 2);
  wall._labelBg.y(centerY - wall._labelBg.height() / 2);
}  document.getElementById('lengthInput').value = Math.round(obj.width());

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




