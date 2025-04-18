const stage = new Konva.Stage({
  container: 'stage-container',
  width: window.innerWidth,
  height: window.innerHeight - 60
});

const layer = new Konva.Layer();
stage.add(layer);

document.getElementById('addWall').addEventListener('click', () => {
  const rect = new Konva.Rect({
    x: 50,
    y: 50,
    width: 100,
    height: 20,
    fill: '#6b4c2b',
    draggable: true
  });
  layer.add(rect);
  layer.draw();
});
