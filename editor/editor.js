// Inicializar el escenario principal con Konva
const stage = new Konva.Stage({
  container: 'stage-container',
  width: 3000,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

// Variables globales
let selected = null;       // Objeto actualmente seleccionado
let transformer = null;    // Transformador para manipular el objeto
let stickers = [];         // Etiquetas para mostrar medidas

// =========================
// FUNCIONES PRINCIPALES
// =========================

// Crear un nuevo muro en la posición dada
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

  // Interacciones visuales
  wall.on('mouseover', () => {
    if (wall !== selected) wall.fill("#666666");
    layer.draw();
  });

  wall.on('mouseout', () => {
    if (wall !== selected) wall.fill("#666666");
    hideStickers();
    layer.draw();
  });

  // Selección del muro al hacer click
  wall.on('click', () => {
    selectObject(wall);
    document.getElementById('toolbar').classList.add('visible');
  });

  // Actualizar medidas al mover o transformar
  wall.on('dragend transformend', () => {
    updateMeasurement();
    updateStickerPositions();
  });

  layer.add(wall);
  layer.draw();
  return wall;
}

// =========================
// EVENTOS DE INTERFAZ
// =========================

// Botón: Añadir muro
document.getElementById('addWall').addEventListener('click', () => {
  const newWall = createWall();
  selectObject(newWall);
});

// Seleccionar un objeto y mostrar sus controles
function selectObject(obj) {
  selected = obj;

  document.getElementById('object-tools').classList.remove('hidden');
  document.getElementById('widthInput').value = Math.round(obj.height());
  document.getElementById('lengthInput').value = Math.round(obj.width());

  if (transformer) transformer.destroy();

  transformer = new Konva.Transformer({
    nodes: [obj],
    enabledAnchors: [] // sin puntos de anclaje visibles
  });

  layer.add(transformer);
  layer.draw();

  showStickers(obj);
}

// Botón: Eliminar objeto seleccionado
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

// Botón: Rotar objeto 90 grados
document.getElementById('rotateObject').addEventListener('click', () => {
  if (selected) {
    selected.rotate(90);
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  }
});

// Botón: Duplicar objeto seleccionado
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

// Cambiar alto manualmente
document.getElementById('widthInput').addEventListener('input', (e) => {
  if (selected) {
    selected.height(parseInt(e.target.value));
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  }
});

// Cambiar ancho manualmente
document.getElementById('lengthInput').addEventListener('input', (e) => {
  if (selected) {
    selected.width(parseInt(e.target.value));
    updateMeasurement();
    updateStickerPositions();
    layer.draw();
  }
});

// =========================
// FUNCIONES DE MEDICIÓN
// =========================

function updateMeasurement() {
  if (!selected) return;

  const text = `${Math.round(selected.width())} x ${Math.round(selected.height())} cm`;
  console.log("Dimensiones:", text);
}

// Posicionar etiquetas de medida (función dummy por ahora)
function updateStickerPositions() {
  // Implementación pendiente
}

function showStickers(obj) {
  // Implementación pendiente
}

function hideStickers() {
  // Implementación pendiente
}
