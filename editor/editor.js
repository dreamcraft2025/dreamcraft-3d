
// Crear el escenario y una única capa global
const stage = new Konva.Stage({
  container: 'stage-container',
  width: window.innerWidth,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

// Función para añadir muro
function addWall() {
  const wall = new Konva.Rect({
    x: 50,
    y: 50,
    width: 100,
    height: 30,
    fill: 'gray',
    draggable: true,
    name: 'muro'
  });

  layer.add(wall);
  layer.draw();
}

// Conectar el botón después de que cargue el documento
window.onload = function () {
  const btn = document.getElementById('addWall');
  if (btn) {
    btn.addEventListener('click', addWall);
  } else {
    console.error("Botón 'addWall' no encontrado");
  }
};
