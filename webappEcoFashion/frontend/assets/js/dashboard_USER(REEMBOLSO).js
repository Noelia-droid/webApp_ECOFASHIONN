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
    
});