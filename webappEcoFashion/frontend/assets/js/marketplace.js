// ========================================
// MARKETPLACE.JS - ECOFASHION
// ========================================

// ========================================
// 🔧 Variables globales
// ========================================
let todosLosProductos = [];
let productosFiltrados = [];

let filtrosActivos = {
  busqueda: '',
  categoria: '',
  talla: '',
  departamento: ''
};

// ========================================
// 🚀 Inicialización principal
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
  cargarTallas();
  cargarDepartamentos();
  cargarProductos();
  inicializarBusqueda();
  inicializarDropdowns(); // ✅ llamada agregada
});

// ========================================
// 📦 Cargar productos desde la BD
// ========================================
async function cargarProductos() {
  try {
    const response = await axios.get(`${API_URL}/api/products`);
    const productos = response.data;
    const contenedor = document.getElementById("productos-container");
    contenedor.innerHTML = "";

    productos.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <div class="card">
          <div class="discount-badge">${p.descuento}% OFF</div>
          <img src="${p.imagen_url}" alt="${p.nombre_producto}" class="product-img"/>
          
          <div class="card-body">
            <span class="categoria">${p.categoria}</span>
            <h3>${p.nombre_producto}</h3>
            
            <div class="precio">
              <span class="actual">S/${p.precio}</span>
              <span class="old">S/${(p.precio * (1 + p.descuento / 100)).toFixed(2)}</span>
            </div>

            <div class="detalle">
              <p>Talla ${p.talla} · <span class="estado">Excelente</span></p>
              <p class="ubicacion">📍 ${p.departamento}</p>
              <p class="vendedor">Por ${p.nombre_vendedor}</p>
            </div>

            <div class="acciones">
              <button class="btn-preview">Pre-visualizar</button>
              <button class="btn-details">Ver Detalles</button>
            </div>
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
  }
}


// ========================================
// 🎨 Renderizar productos en el grid
// ========================================
function renderizarProductos(productos) {
  const container = document.getElementById('productosContainer');
  if (!container) return;

  if (!productos || productos.length === 0) {
    container.innerHTML = `<div class="mensaje-vacio"><p>No se encontraron productos</p></div>`;
    return;
  }

  container.innerHTML = productos.map(crearTarjetaProducto).join('');
  lucide.createIcons();
}

// ========================================
// 🧩 Crear tarjeta de producto
// ========================================
function crearTarjetaProducto(producto) {
  const estrellas = generarEstrellas(producto.valoracion_promedio || 0);
  const imagenUrl = producto.imagen_url || '/assets/images/placeholder.jpg';

  return `
    <div class="producto-card" data-id="${producto.id_producto}">
      <div class="producto-imagen">
        <img src="${imagenUrl}" alt="${producto.nombre_producto}" />
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
        <button class="btn-ver-detalles" onclick="verDetalleProducto(${producto.id_producto})">Ver detalles</button>
      </div>
    </div>
  `;
}

// ========================================
// ⭐ Generar estrellas de valoración
// ========================================
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

// ========================================
// 🔍 Aplicar filtros locales (opcional)
// ========================================
function aplicarFiltros() {
  productosFiltrados = todosLosProductos.filter(producto => {
    const coincideBusqueda = !filtrosActivos.busqueda ||
      producto.nombre_producto?.toLowerCase().includes(filtrosActivos.busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(filtrosActivos.busqueda.toLowerCase());

    const coincideCategoria = !filtrosActivos.categoria || producto.categoria === filtrosActivos.categoria;
    const coincideTalla = !filtrosActivos.talla || producto.talla === filtrosActivos.talla;

    return coincideBusqueda && coincideCategoria && coincideTalla;
  });

  renderizarProductos(productosFiltrados);
}

// ========================================
// 📁 Cargar categorías desde la BD
// ========================================
async function cargarCategorias() {
  try {
const res = await axios.get(`${API_URL}/api/categories`);
    const categorias = res.data;
    const menu = document.getElementById('categoriaMenu');
    menu.innerHTML = '';

    const todas = document.createElement('div');
    todas.className = 'dropdown-item selected';
    todas.dataset.value = '';
    todas.textContent = 'Todas las categorías';
    menu.appendChild(todas);

    categorias.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = cat.nombre_categoria;
      item.textContent = cat.nombre_categoria;
      menu.appendChild(item);
    });

    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById('categoriaSelected').textContent = item.textContent;
        document.getElementById('categoriaSelected').dataset.value = item.dataset.value;
      });
    });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// ========================================
// 📁 Cargar tallas desde la BD
// ========================================
async function cargarTallas() {
  try {
const res = await axios.get(`${API_URL}/api/sizes`);
    const tallas = res.data;
    const menu = document.getElementById('tallaMenu');
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
        document.getElementById('tallaSelected').textContent = item.textContent;
        document.getElementById('tallaSelected').dataset.value = item.dataset.value;
      });
    });
  } catch (error) {
    console.error('Error al cargar tallas:', error);
  }
}

// ========================================
// 📁 Cargar departamentos desde la BD
// ========================================
async function cargarDepartamentos() {
  try {
const res = await axios.get(`${API_URL}/api/departments`);
    const departamentos = res.data;
    const menu = document.getElementById('departamentoMenu');
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
        document.getElementById('departamentoSelected').textContent = item.textContent;
        document.getElementById('departamentoSelected').dataset.value = item.dataset.value;
      });
    });
  } catch (error) {
    console.error('Error al cargar departamentos:', error);
  }
}

// ========================================
// 🔎 Buscar productos con filtros activos
// ========================================
async function buscarProductos() {
  const busqueda = document.getElementById('busqueda').value.trim();
  const categoria = document.getElementById('categoriaSelected')?.dataset.value || '';
  const talla = document.getElementById('tallaSelected')?.dataset.value || '';
  const departamento = document.getElementById('departamentoSelected')?.dataset.value || '';

  try {
        const res = await axios.get('/api/productos/buscar', {
      params: { busqueda, categoria, talla, departamento }
    });

    const productos = res.data;
    productosFiltrados = productos;
    renderizarProductos(productosFiltrados);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    mostrarMensajeError();
  }
}

// ========================================
// ⌨️ Inicializar búsqueda por Enter o botón
// ========================================
function inicializarBusqueda() {
  const input = document.getElementById('busqueda');
  const btn = document.getElementById('buscarBtn');

  if (!input || !btn) return;

  const buscar = () => buscarProductos();

  btn.addEventListener('click', buscar);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscar();
  });
}

// ========================================
// 🔍 Ver detalle del producto
// ========================================
function verDetalleProducto(id) {
  window.location.href = `/pages/producto-detalle.html?id=${id}`;
}

// ========================================
// ⚠️ Mostrar mensaje de error
// ========================================
function mostrarMensajeError() {
  const container = document.getElementById('productosContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="mensaje-error">
      <i data-lucide="alert-circle"></i>
      <p>Error al cargar los productos. Intenta de nuevo más tarde.</p>
    </div>
  `;
  lucide.createIcons();
}

// ========================================
// 🔌 Socket.IO (actualización en tiempo real)
// ========================================
if (typeof io !== 'undefined') {
  const socket = io();

  socket.on('productoActualizado', (productoActualizado) => {
    const index = todosLosProductos.findIndex(p => p.id_producto === productoActualizado.id_producto);
    if (index !== -1) {
      todosLosProductos[index] = productoActualizado;
      aplicarFiltros();
    }
  });
}

// ========================================
// 🧭 Inicializar dropdowns (categoría, talla, departamento)
// ========================================
function inicializarDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-toggle');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', () => {
      dropdown.classList.toggle('abierto');
    });
  });
}