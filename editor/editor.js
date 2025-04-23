
const stage = new Konva.Stage({
  container: 'stage-container',
  width: window.innerWidth,
  height: window.innerHeight - 60
});

const layer = new Konva.Layer();
stage.add(layer);

function addWall() {
  const wall = new Konva.Rect({
    x: 100,
    y: 100,
    width: 120,
    height: 40,
    fill: 'gray',
    draggable: true,
    name: 'muro'
  });
  layer.add(wall);
  layer.draw();
}

window.onload = () => {
  document.getElementById('addWall').addEventListener('click', addWall);
};
