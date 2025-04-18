const stage = new Konva.Stage({
  container: 'stage-container',
  width: window.innerWidth - 220,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

let selected = null;
let measureLabel = null;

// Función para crear un muro
function createWall(x = 50, y = 50, width = 100, height = 20) {
  const wall = new Konva.Rect({
    x,
    y,
    width,
    height,
    fill: '#6b4c2b',
    draggable: true,
    name: 'wall'
  });

  wall.on('click', () => {
    selectObject(wall);
  });

  wall.on('transformend', updateMeasurement);
  wall.on('dragend', updateMeasurement);

  layer.add(wall);
  layer.draw();
  return wall;
}

document.getElementById('addWall').addEventListener('click', () => {
  const newWall = createWall();
  selectObject(newWall);
});

function selectObject(obj) {
  selected = obj;
  document.getElementById('object-tools').classList.remove('hidden');

  // Mostrar medida inicial
  document.getElementById('widthInput').value = Math.round(obj.width());

  updateMeasurement();

  // Hacer redimensionable
  const tr = new Konva.Transformer({
    nodes: [obj],
    enabledAnchors: ['middle-left', 'middle-right'],
    boundBoxFunc: function (oldBox, newBox) {
      newBox.height = oldBox.height; // Bloquear altura
      return newBox;
    }
  });

  layer.find('Transformer').destroy();
  layer.add(tr);
  layer.draw();

  // Escuchar cambios en el input de ancho
  document.getElementById('widthInput').oninput = (e) => {
    const newWidth = parseInt(e.target.value);
    if (!isNaN(newWidth)) {
      obj.width(newWidth);
      layer.draw();
      updateMeasurement();
    }
  };
}

document.getElementById('deleteObject').addEventListener('click', () => {
  if (selected) {
    selected.destroy();
    document.getElementById('object-tools').classList.add('hidden');
    layer.find('Transformer').destroy();
    layer.draw();
    selected = null;
    if (measureLabel) {
      measureLabel.remove();
      measureLabel = null;
    }
  }
});

document.getElementById('rotateObject').addEventListener('click', () => {
  if (selected) {
    selected.rotation((selected.rotation() + 90) % 360);
    layer.draw();
    updateMeasurement();
  }
});

document.getElementById('duplicateObject').addEventListener('click', () => {
  if (selected) {
    const clone = createWall(selected.x() + 20, selected.y() + 20, selected.width(), selected.height());
    selectObject(clone);
  }
});

function updateMeasurement() {
  if (!selected) return;

  if (!measureLabel) {
    measureLabel = document.createElement('div');
    measureLabel.className = 'measure-label';
    document.body.appendChild(measureLabel);
  }

  const pos = selected.getClientRect();
  const text = `${Math.round(selected.width())} cm x ${Math.round(selected.height())} cm`;

  measureLabel.innerText = text;
  measureLabel.style.left = `${pos.x + 230}px`;
  measureLabel.style.top = `${pos.y + 10}px`;
}
