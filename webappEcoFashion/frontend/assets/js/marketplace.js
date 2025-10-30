// MARKETPLACE.JS - ECOFASHION

// Almacena todos los productos obtenidos desde la API
let todosLosProductos = [];

// Almacena los productos que cumplen con los filtros activos
let productosFiltrados = [];

// Estado actual de los filtros aplicados por el usuario
const filtrosActivos = {
  busqueda: '',
  categoria: '',
  talla: '',
  departamento: ''
};

// Ejecuta funciones clave al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();       // Carga opciones de categoría
  cargarTallas();           // Carga opciones de talla
  cargarDepartamentos();    // Carga opciones de ubicación
  cargarProductos();        // Obtiene y muestra todos los productos
  inicializarBusqueda();    // Activa búsqueda por botón o Enter
  inicializarDropdowns();   // Activa comportamiento de los dropdowns
});

// Obtiene productos desde la API y los renderiza
async function cargarProductos() {
  try {
    const response = await axios.get(`${API_URL}/api/products`);
    todosLosProductos = response.data;
    productosFiltrados = [...todosLosProductos];
    renderizarProductos(productosFiltrados);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mostrarMensajeError();
  }
}

// Muestra los productos en el contenedor principal
function renderizarProductos(productos) {
  const container = document.getElementById('product-container');
  if (!container) return;

  // Si no hay productos, muestra mensaje vacío
  if (!productos || productos.length === 0) {
    container.innerHTML = `<div class="mensaje-vacio"><p>No se encontraron productos</p></div>`;
    return;
  }

  // Inserta las tarjetas HTML generadas
  container.innerHTML = productos.map(crearTarjetaProducto).join('');
  lucide.createIcons(); // Renderiza íconos SVG

  // Asigna evento a cada botón "Ver detalles"
  document.querySelectorAll('.btn-ver-detalles').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      verDetalleProducto(id);
    });
  });

  // Asigna fallback de imagen si falla la carga
  document.querySelectorAll('.producto-img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = '/assets/images/polo_mujer.png';
    });
  });
}

// Genera el HTML de una tarjeta de producto
function crearTarjetaProducto(producto) {
  const estrellas = generarEstrellas(producto.valoracion_promedio || 0);
  const imagenUrl = producto.imagen_url?.includes('assets/')
    ? `/${producto.imagen_url}`
    : `/assets/images/${producto.imagen_url || 'placeholder.jpg'}`;

  return `
  <div class="producto-card" data-id="${producto.id_producto}">
    <div class="producto-imagen">
      <img src="${imagenUrl}" alt="${producto.nombre_producto}" class="producto-img" />
      <span class="producto-estado ${producto.estado_producto?.toLowerCase()}">${producto.estado_producto}</span>
    </div>
    <div class="producto-info">
      <div class="producto-categoria">${producto.categoria}</div>
      <h3 class="producto-nombre">${producto.nombre_producto}</h3>
      <div class="producto-detalles">
        <span class="producto-talla">Talla: ${producto.talla || 'N/A'}</span>
        <span class="producto-precio">S/ ${parseFloat(producto.precio).toFixed(2)}</span>
      </div>
      <div class="producto-vendedor">
        <i data-lucide="user" class="icon-small"></i>
        <span>${producto.nombre_vendedor}</span>
      </div>
      <div class="producto-ubicacion">
        <i data-lucide="map-pin" class="icon-small"></i>
        <span>${producto.departamento || 'No especificado'}</span>
      </div>
      <div class="producto-valoracion">
        <div class="estrellas">${estrellas}</div>
        <span class="valoracion-numero">(${producto.total_resenas || 0})</span>
      </div>
      <button class="btn-ver-detalles" data-id="${producto.id_producto}">Ver detalles</button>
    </div>
  </div>
  `;
}

// Genera estrellas visuales según la valoración promedio
function generarEstrellas(valoracion) {
  const estrellaLlena = '<i data-lucide="star" class="estrella llena"></i>';
  const estrellaMedia = '<i data-lucide="star" class="estrella media"></i>';
  const estrellaVacia = '<i data-lucide="star" class="estrella vacia"></i>';

  let estrellas = '';
  const redondeada = Math.round(valoracion * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= redondeada) estrellas += estrellaLlena;
    else if (i - 0.5 === redondeada) estrellas += estrellaMedia;
    else estrellas += estrellaVacia;
  }

  return estrellas;
}

// Filtra los productos según los filtros activos
function aplicarFiltros() {
  productosFiltrados = todosLosProductos.filter(producto => {
    const coincideBusqueda = !filtrosActivos.busqueda ||
      producto.nombre_producto?.toLowerCase().includes(filtrosActivos.busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(filtrosActivos.busqueda.toLowerCase());

    const coincideCategoria = !filtrosActivos.categoria || producto.categoria === filtrosActivos.categoria;
    const coincideTalla = !filtrosActivos.talla || producto.talla === filtrosActivos.talla;
    const coincideDepartamento = !filtrosActivos.departamento || producto.departamento === filtrosActivos.departamento;

    return coincideBusqueda && coincideCategoria && coincideTalla && coincideDepartamento;
  });

  renderizarProductos(productosFiltrados);
}
// Carga las categorías desde la API y las inserta en el menú
async function cargarCategorias() {
  try {
    const res = await axios.get(`${API_URL}/api/categories`);
    const categorias = res.data;
    const menu = document.getElementById('categoriaMenu');
    if (!menu) return;
    menu.innerHTML = '';

    // Opción por defecto: todas las categorías
    const todas = document.createElement('div');
    todas.className = 'dropdown-item selected';
    todas.dataset.value = '';
    todas.textContent = 'Todas las categorías';
    menu.appendChild(todas);

    // Inserta cada categoría como opción
    categorias.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = cat.nombre_categoria;
      item.textContent = cat.nombre_categoria;
      menu.appendChild(item);
    });

    // Asigna evento de selección y aplica filtro
    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const selected = document.getElementById('categoriaSelected');
        if (!selected) return;
        selected.textContent = item.textContent;
        selected.dataset.value = item.dataset.value;
        filtrosActivos.categoria = item.dataset.value;
        aplicarFiltros();
      });
    });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Carga las tallas desde la API y las inserta en el menú
async function cargarTallas() {
  try {
    const res = await axios.get(`${API_URL}/api/sizes`);
    const tallas = res.data;
    const menu = document.getElementById('tallaMenu');
    if (!menu) return;
    menu.innerHTML = '';

    const todas = document.createElement('div');
    todas.className = 'dropdown-item selected';
    todas.dataset.value = '';
    todas.textContent = 'Todas las tallas';
    menu.appendChild(todas);

    tallas.forEach(t => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = t.nombre_talla;
      item.textContent = t.nombre_talla;
      menu.appendChild(item);
    });

    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const selected = document.getElementById('tallaSelected');
        if (!selected) return;
        selected.textContent = item.textContent;
        selected.dataset.value = item.dataset.value;
        filtrosActivos.talla = item.dataset.value;
        aplicarFiltros();
      });
    });
  } catch (error) {
    console.error('Error al cargar tallas:', error);
  }
}

// Carga los departamentos desde la API y los inserta en el menú
async function cargarDepartamentos() {
  try {
    const res = await axios.get(`${API_URL}/api/departments`);
    const departamentos = res.data;
    const menu = document.getElementById('departamentoMenu');
    if (!menu) return;
    menu.innerHTML = '';

    const todos = document.createElement('div');
    todos.className = 'dropdown-item selected';
    todos.dataset.value = '';
    todos.textContent = 'Todos los departamentos';
    menu.appendChild(todos);

    departamentos.forEach(dep => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = dep.provincia;
      item.textContent = dep.provincia;
      menu.appendChild(item);
    });

    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const selected = document.getElementById('departamentoSelected');
        if (!selected) return;
        selected.textContent = item.textContent;
        selected.dataset.value = item.dataset.value;
        filtrosActivos.departamento = item.dataset.value;
        aplicarFiltros();
      });
    });
  } catch (error) {
    console.error('Error al cargar departamentos:', error);
  }
}

// Inicializa la búsqueda por botón o tecla Enter
function inicializarBusqueda() {
  const input = document.getElementById('busqueda');
  const btn = document.getElementById('buscarBtn');
  if (!input || !btn) return;

  const buscar = () => {
    filtrosActivos.busqueda = input.value.trim();
    aplicarFiltros();
  };

  btn.addEventListener('click', buscar);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscar();
  });
}

// Redirecciona al detalle del producto seleccionado
function verDetalleProducto(id) {
  window.location.href = `/pages/producto-detalle.html?id=${id}`;
}

// Muestra mensaje de error si falla la carga de productos
function mostrarMensajeError() {
  const container = document.getElementById('product-container');
  if (!container) return;

  container.innerHTML = `
    <div class="mensaje-error">
      <i data-lucide="alert-circle"></i>
      <p>Error al cargar los productos. Intenta de nuevo más tarde.</p>
      <button id="reintentarCarga">Reintentar</button>
    </div>
  `;
  lucide.createIcons();

  // Permite reintentar la carga de productos
  document.getElementById('reintentarCarga')?.addEventListener('click', cargarProductos);
}

// Activa el comportamiento de los dropdowns (mostrar/ocultar)
function inicializarDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-toggle');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', () => {
      dropdown.classList.toggle('abierto');
    });
  });
}

// Escucha eventos en tiempo real desde el servidor (Socket.IO)
if (typeof io !== 'undefined') {
  const socket = io();

  // Si un producto se actualiza, se reemplaza en la lista y se re-renderiza
  socket.on('productoActualizado', (productoActualizado) => {
    const index = todosLosProductos.findIndex(p => p.id_producto === productoActualizado.id_producto);
    if (index !== -1) {
      todosLosProductos[index] = productoActualizado;
      aplicarFiltros();
    }
  });
}
