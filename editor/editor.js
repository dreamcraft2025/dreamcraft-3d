const stage = new Konva.Stage({
  container: 'stage-container',
  width: 3000,
  height: window.innerHeight
});

// Capa de fondo con rejilla
const gridLayer = new Konva.Layer();
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

stage.add(gridLayer);

function drawGrid() {
  gridLayer.destroyChildren();
  const viewPos = stage.position();
  const stageWidth = stage.width();
  const stageHeight = stage.height();
  const extra = 2000;
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

const layer = new Konva.Layer();
stage.add(layer);

let selected = null;
let transformer = null;
let stickers = [];

const SNAP_THRESHOLD = 5;
const guideLine = new Konva.Line({
  stroke: 'red',
  strokeWidth: 2,
  visible: false,
  points: [],
  dash: [4, 4],
});
layer.add(guideLine);

function getWallEnds(wall) {
  return {
    start: { x: wall.x(), y: wall.y() },
    end: { x: wall.x() + wall.width(), y: wall.y() + wall.height() },
  };
}

function snapWall(wall) {
  const walls = layer.find('.wall');
  const currentEnds = getWallEnds(wall);

  walls.forEach(other => {
    if (other === wall) return;
    const otherEnds = getWallEnds(other);

    for (const end1 of [currentEnds.start, currentEnds.end]) {
      for (const end2 of [otherEnds.start, otherEnds.end]) {
        const dx = end2.x - end1.x;
        const dy = end2.y - end1.y;
        if (Math.hypot(dx, dy) < SNAP_THRESHOLD) {
          wall.x(wall.x() + dx);
          wall.y(wall.y() + dy);
          layer.draw();
          return;
        }
      }
    }
  });
}

function showGuide(wall) {
  let visible = false;
  const walls = layer.find('.wall');
  const currentEnds = getWallEnds(wall);

  walls.forEach(other => {
    if (other === wall) return;
    const otherEnds = getWallEnds(other);

    for (const end1 of [currentEnds.start, currentEnds.end]) {
      for (const end2 of [otherEnds.start, otherEnds.end]) {
        const dx = end2.x - end1.x;
        const dy = end2.y - end1.y;
        if (Math.hypot(dx, dy) < SNAP_THRESHOLD) {
          guideLine.points([end1.x, end1.y, end2.x, end2.y]);
          guideLine.visible(true);
          visible = true;
        }
      }
    }
  });
  if (!visible) guideLine.visible(false);
  layer.batchDraw();
}

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
    if (wall !== selected) wall.fill("#666666");
    layer.draw();
  });

  wall.on('mouseout', () => {
    if (wall !== selected) wall.fill("#666666");
    hideStickers();
    layer.draw();
  });

  wall.on('click', () => {
    selectObject(wall);
    document.getElementById('toolbar').classList.add('visible');
  });

  wall.on('dragmove', () => {
    showGuide(wall);
  });

  wall.on('dragend transformend', () => {
    guideLine.visible(false);
    snapWall(wall);
    updateMeasurement();
    updateStickerPositions();
  });

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
  document.getElementById('widthInput').value = Math.round(obj.height());
  document.getElementById('lengthInput').value = Math.round(obj.width());

  if (transformer) transformer.destroy();

  transformer = new Konva.Transformer({
    nodes: [obj],
    ignoreStroke: true,
    rotateEnabled: false,
    boundBoxFunc: (oldBox, newBox) => {
      newBox.height = oldBox.height;
      return newBox;
    },
  });

  layer.add(transformer);
  transformer.moveToTop();
  layer.draw();
}

function hideStickers() {
  stickers.forEach(s => s.hide());
  layer.draw();
}

function updateStickerPositions() {}
function updateMeasurement() {}
