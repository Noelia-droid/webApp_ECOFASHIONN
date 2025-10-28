document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('pedidos-container');
    const tabButtons = document.querySelectorAll('.tabs button');

    // Activar el primer tab por defecto
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
        const defaultEstado = tabButtons[0].getAttribute('data-tab');
        fetchPedidos(defaultEstado);
    }

    // Funcionalidad de tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const estado = this.getAttribute('data-tab');
            fetchPedidos(estado);
        });
    });

    // ================================
    // 🔄 Cargar pedidos desde backend
    // ================================
function fetchPedidos(estado) {
        container.innerHTML = '<p class="empty-message">Cargando pedidos...</p>';

        axiosInstance.get(`/orders?estado=${estado}`)
            .then(response => {
                const pedidos = response.data;
                console.log('Respuesta cruda:', pedidos);

                if (!Array.isArray(pedidos)) {
                    console.error('La respuesta no es un array:', pedidos);
                    container.innerHTML = '<p class="empty-message">Error: respuesta inválida</p>';
                    return;
                }

                renderPedidos(pedidos);
            })
    }

    // ================================
    // 🧾 Renderizar pedidos en pantalla
    // ================================
    function renderPedidos(pedidos) {
        container.innerHTML = '';

        if (!pedidos || pedidos.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay pedidos para mostrar</p>';
            return;
        }

        pedidos.forEach(pedido => {
            const estadoCapitalizado = capitalizar(pedido.estado);

            const pedidoCard = document.createElement('div');
            pedidoCard.className = 'pedido-card';
            pedidoCard.innerHTML = `
                <h3>Pedido ${pedido.id}</h3>
                <p><strong>Fecha:</strong> ${pedido.fecha}</p>
                <p><strong>Total:</strong> ${pedido.total}</p>
                <p><strong>Estado:</strong> <span style="color: ${getEstadoColor(estadoCapitalizado)};">${estadoCapitalizado}</span></p>
                <ul>
                    ${pedido.productos.map(prod => `<li>• ${prod}</li>`).join('')}
                </ul>
                <div class="pedido-actions">
                    <button class="btn-detalles">Ver detalles</button>
                    <button class="btn-factura">Descargar factura</button>
                    ${estadoCapitalizado === 'Entregado' ? '<button class="btn-reordenar">Reordenar</button>' : ''}
                </div>
            `;
            container.appendChild(pedidoCard);
        });
    }

    // ================================
    // 🎨 Color por estado
    // ================================
    function getEstadoColor(estado) {
        switch (estado) {
            case 'Entregado':
                return '#1a6639';
            case 'Enviado':
                return '#0066cc';
            case 'Procesando':
                return '#ff9500';
            case 'Cancelado':
                return '#cc0000';
            default:
                return '#6b6a6a';
        }
    }

    // ================================
    // 🔠 Capitalizar texto
    // ================================
    function capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }
});
