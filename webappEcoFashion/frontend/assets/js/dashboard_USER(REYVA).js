document.addEventListener('DOMContentLoaded', function () {
  const ratingsContainer = document.getElementById('ratings-container');
  const tabButtons = document.querySelectorAll('.tabs button');

  // Activar el primer tab por defecto
  if (tabButtons.length > 0) {
    tabButtons[0].classList.add('active');
    const defaultTab = tabButtons[0].getAttribute('data-tab');
    loadResenas(defaultTab);
  }

  // Funcionalidad de tabs
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const tab = this.getAttribute('data-tab');
      loadResenas(tab);
    });
  });

  // Función para cargar contenido dinámico
  function loadResenas(tab) {
    ratingsContainer.innerHTML = `<p>Cargando reseñas <strong>${tab}</strong>...</p>`;

    // Simulación de carga (puedes reemplazar con fetch si conectas a backend)
    setTimeout(() => {
      switch (tab) {
        case 'todas':
          ratingsContainer.innerHTML = `<h3>Todas tus reseñas</h3><p>Listado completo de productos calificados.</p>`;
          break;
        case 'pendientes':
          ratingsContainer.innerHTML = `<h3>Reseñas pendientes</h3><p>Productos que aún no has calificado.</p>`;
          break;
        case 'completadas':
          ratingsContainer.innerHTML = `<h3>Reseñas completadas</h3><p>Productos que ya has valorado.</p>`;
          break;
        default:
          ratingsContainer.innerHTML = `<p>Sección no encontrada.</p>`;
      }
    }, 300);
  }
});
