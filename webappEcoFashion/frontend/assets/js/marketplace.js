// Función para manejar dropdowns personalizados
document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    // Variables para almacenar filtros seleccionados
    let filtros = {
        busqueda: '',
        categoria: '',
        talla: ''
    };
    
    // Array para almacenar todos los productos
    let todosLosProductos = [];
    
    // Cargar productos desde la base de datos
    cargarProductos();
    
    // Función para cargar productos desde el backend
    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos'); // Ajusta esta URL a tu API
            const productos = await response.json();
            todosLosProductos = productos;
            mostrarProductos(productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            // Mostrar mensaje de error al usuario
            document.getElementById('productosContainer').innerHTML = 
                '<p style="text-align: center; padding: 40px;">Error al cargar los productos. Intenta nuevamente.</p>';
        }
    }
    
    // Función para mostrar productos en el DOM
    function mostrarProductos(productos) {
        const container = document.getElementById('productosContainer');
        
        if (productos.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No se encontraron productos.</p>';
            return;
        }
        
        container.innerHTML = productos.map(producto => `
            <div class="producto-card" data-categoria="${producto.categoria}" data-talla="${producto.talla}" data-id="${producto.id}">
                <div class="producto-imagen">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    ${producto.descuento ? `<span class="producto-descuento">-${producto.descuento}%</span>` : ''}
                </div>
                <div class="producto-info">
                    <h3 class="producto-titulo">${producto.nombre}</h3>
                    <p class="producto-descripcion">${producto.descripcion}</p>
                    <div class="producto-precios">
                        <span class="producto-precio">S/ ${producto.precio.toFixed(2)}</span>
                        ${producto.precioOriginal ? `<span class="producto-precio-original">S/ ${producto.precioOriginal.toFixed(2)}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Función para manejar cada dropdown
    function initDropdown(toggleId, menuId, selectedId, filtroKey) {
        const toggle = document.getElementById(toggleId);
        const menu = document.getElementById(menuId);
        const selected = document.getElementById(selectedId);
        
        if (!toggle || !menu || !selected) return;
        
        // Abrir/cerrar dropdown
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            // Cerrar otros dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle').forEach(t => {
                if (t !== toggle) t.classList.remove('active');
            });
            
            menu.classList.toggle('show');
            toggle.classList.toggle('active');
        });
        
        // Seleccionar item
        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remover selección previa
                menu.querySelectorAll('.dropdown-item').forEach(i => {
                    i.classList.remove('selected');
                });
                
                // Agregar selección nueva
                this.classList.add('selected');
                selected.textContent = this.textContent;
                
                // Guardar el valor del filtro
                filtros[filtroKey] = this.getAttribute('data-value') || '';
                
                // Cerrar dropdown
                menu.classList.remove('show');
                toggle.classList.remove('active');
                
                // Aplicar filtros automáticamente
                aplicarFiltros();
            });
        });
    }
    
    // Inicializar dropdowns
    initDropdown('categoriaToggle', 'categoriaMenu', 'categoriaSelected', 'categoria');
    initDropdown('tallaToggle', 'tallaMenu', 'tallaSelected', 'talla');
    
    // Manejar búsqueda
    const inputBusqueda = document.getElementById('busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function() {
            filtros.busqueda = this.value.toLowerCase();
        });
    }
    
    // Botón buscar
    const btnBuscar = document.getElementById('buscarBtn');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', aplicarFiltros);
    }
    
    // Función para aplicar filtros
    function aplicarFiltros() {
        let productosFiltrados = todosLosProductos.filter(producto => {
            // Filtrar por búsqueda
            if (filtros.busqueda) {
                const textoProducto = `${producto.nombre} ${producto.descripcion}`.toLowerCase();
                if (!textoProducto.includes(filtros.busqueda)) {
                    return false;
                }
            }
            
            // Filtrar por categoría
            if (filtros.categoria && producto.categoria !== filtros.categoria) {
                return false;
            }
            
            // Filtrar por talla
            if (filtros.talla && producto.talla !== filtros.talla) {
                return false;
            }
            
            return true;
        });
        
        // Mostrar productos filtrados
        mostrarProductos(productosFiltrados);
    }
    
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    });
});