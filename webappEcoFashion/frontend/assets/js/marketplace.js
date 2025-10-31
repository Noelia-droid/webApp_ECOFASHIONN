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
  cargarCategorias();       // Carga opciones de categoría desde BD
  cargarTallas();           // Carga opciones de talla desde BD
  cargarDepartamentos();    // Carga opciones de ubicación desde BD
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

function mostrarOverlayProducto(id) {
  const overlay = document.getElementById('seller-overlay');
  if (!overlay) return;

  overlay.classList.remove('hidden');

  axios.get(`${API_URL}/api/products/${id}`)
    .then(res => {
      const p = res.data;

      document.getElementById('overlay-nombre').textContent = p.nombre_producto;
      document.getElementById('overlay-vendedor').textContent = `Vendido por ${p.nombre_vendedor}`;
      document.getElementById('overlay-vendidos').textContent = `(${p.total_ventas || 0} vendidos)`;
      document.getElementById('overlay-rating').textContent = parseFloat(p.valoracion_promedio || 0).toFixed(1);
      document.getElementById('overlay-precio').textContent = `S/ ${parseFloat(p.precio).toFixed(2)}`;
      document.getElementById('overlay-precio-original').textContent = p.precio_original
        ? `S/ ${parseFloat(p.precio_original).toFixed(2)}`
        : '';
      document.getElementById('overlay-descuento').textContent = p.precio_original
        ? `${Math.round((1 - p.precio / p.precio_original) * 100)}% OFF`
        : '';
      document.getElementById('overlay-condicion').textContent = p.estado_producto || '---';
      document.getElementById('overlay-ubicacion').textContent = p.departamento || '---';

      const imgDiv = overlay.querySelector('.chaqueta-de');
      imgDiv.style.backgroundImage = `url('/assets/images/${p.imagen_url || 'placeholder.jpg'}')`;
    })
    .catch(err => {
      console.error('Error al cargar producto para previsualización:', err);
    });
}

document.getElementById('closeOverlay')?.addEventListener('click', () => {
  document.getElementById('seller-overlay')?.classList.add('hidden');
});

// Muestra los productos en el contenedor principal
function renderizarProductos(productos) {
  const container = document.getElementById('products-container');
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

  // Redirección al hacer clic en toda la tarjeta
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Evita que el botón interno dispare la redirección
      if (e.target.classList.contains('btn-previsualizar')) return;
      const id = card.dataset.id;
      verDetalleProducto(id);
    });
  });

  // Muestra overlay al hacer clic en "Pre-visualizar producto"
  document.querySelectorAll('.btn-previsualizar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      mostrarOverlayProducto(id);
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
  <div class="product-card" data-id="${producto.id_producto}">
    <div class="product-image">
      <img src="${imagenUrl}" alt="${producto.nombre_producto}" class="product-img" />
      <span class="product-status ${producto.estado_producto?.toLowerCase()}">${producto.estado_producto}</span>
    </div>
    <div class="product-info">
      <div class="product-category">${producto.categoria}</div>
      <h3 class="product-name">${producto.nombre_producto}</h3>
      <div class="product-details">
        <span class="product-size">Talla: ${producto.talla || 'N/A'}</span>
        <span class="product-price">S/ ${parseFloat(producto.precio).toFixed(2)}</span>
      </div>
      <div class="product-seller">
        <i data-lucide="user" class="icon-small"></i>
        <span>${producto.nombre_vendedor}</span>
      </div>
      <div class="product-location">
        <i data-lucide="map-pin" class="icon-small"></i>
        <span>${producto.departamento || 'No especificado'}</span>
      </div>
      <div class="product-rating">
        <div class="stars">${estrellas}</div>
        <span class="rating-count">(${producto.total_resenas || 0})</span>
      </div>
      <button class="btn-previsualizar" data-id="${producto.id_producto}">Pre-visualizar</button>
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
    const menu = document.getElementById('categoryMenu'); // 
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
        // Remueve la clase 'selected' de todos los items
        menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
        // Agrega la clase 'selected' al item clickeado
        item.classList.add('selected');
        
        const selected = document.getElementById('categorySelected'); 
        if (!selected) return;
        selected.textContent = item.textContent;
        filtrosActivos.categoria = item.dataset.value;
        
        // Cierra el dropdown
        document.getElementById('categoryToggle').classList.remove('active'); 
        menu.classList.remove('show');
        
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
    const menu = document.getElementById('sizeMenu'); 
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
        // Remueve la clase 'selected' de todos los items
        menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
        // Agrega la clase 'selected' al item clickeado
        item.classList.add('selected');
        
        const selected = document.getElementById('sizeSelected'); 
        if (!selected) return;
        selected.textContent = item.textContent;
        filtrosActivos.talla = item.dataset.value;
        
        // Cierra el dropdown
        document.getElementById('sizeToggle').classList.remove('active'); 
        menu.classList.remove('show');
        
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
    const menu = document.getElementById('departmentMenu'); //
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
        // Remueve la clase 'selected' de todos los items
        menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
        // Agrega la clase 'selected' al item clickeado
        item.classList.add('selected');
        
        const selected = document.getElementById('departmentSelected'); 
        if (!selected) return;
        selected.textContent = item.textContent;
        filtrosActivos.departamento = item.dataset.value;
        
        // Cierra el dropdown
        document.getElementById('departmentToggle').classList.remove('active'); 
        menu.classList.remove('show');
        
        aplicarFiltros();
      });
    });
  } catch (error) {
    console.error('Error al cargar departamentos:', error);
  }
}

// Inicializa la búsqueda por botón o tecla Enter
function inicializarBusqueda() {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
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
  const container = document.getElementById('products-container');
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
  
  dropdowns.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Cierra todos los otros dropdowns
      dropdowns.forEach(otherToggle => {
        if (otherToggle !== toggle) {
          otherToggle.classList.remove('active');
          const otherMenu = otherToggle.nextElementSibling;
          if (otherMenu) otherMenu.classList.remove('show');
        }
      });
      
      // Toggle del dropdown actual
      toggle.classList.toggle('active');
      const menu = toggle.nextElementSibling;
      if (menu) menu.classList.toggle('show');
    });
  });
  
  // Cierra los dropdowns al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      dropdowns.forEach(toggle => {
        toggle.classList.remove('active');
        const menu = toggle.nextElementSibling;
        if (menu) menu.classList.remove('show');
      });
    }
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