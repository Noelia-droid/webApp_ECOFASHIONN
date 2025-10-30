// sidebar_USER.js
(function () {
    const menuToggle = document.getElementById('menuToggle') || document.querySelector('.icon-menu');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (!menuToggle || !sidebar) {
        console.warn('Sidebar elements not found');
        return;
    }

    function toggleSidebar() {
        // En desktop: toggle hidden class
        // En móvil: toggle active class
        if (window.innerWidth > 768) {
            sidebar.classList.toggle('hidden');
            document.body.classList.toggle('sidebar-collapsed');
        } else {
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        }
    }

    menuToggle.addEventListener('click', toggleSidebar);

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    }

    // Cerrar con Escape (solo móvil)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });

    // Inicializar email del usuario
    const userEmail = 'holiwispandivis@gmail.com';
    const emailElement = document.getElementById('user-email');
    const avatarElement = document.querySelector('.user-avatar');

    if (emailElement) emailElement.textContent = userEmail;
    if (avatarElement) avatarElement.textContent = userEmail.charAt(0).toUpperCase();
})();

// ============================================
// NAVEGACIÓN DEL SIDEBAR
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Configuración de rutas
    const routes = {
        'carrito': '/pages/dashboard_CARRITO.html',
        'pedidos': '/pages/dashboard_PEDIDOS.html',
        'historial': '/pages/dashboard_HISTORIAL.html',
        'deseos': '/pages/dashboard_DESEOS.html',
        'reembolsos': '/pages/dashboard_REEMBOLSOS.html',
        'valoraciones': '/pages/dashboard_VALORACIONES.html',
        'mensajes': '/pages/dashboard_MENSAJES.html',
        'perfil': '/pages/dashboard_PERFIL.html',
        'vender': '/pages/dashboard_VENDER.html',
        'soporte': '/pages/dashboard_SOPORTE.html',
        'configuracion': '/pages/dashboard_CONFIGURACION.html'
    };

    // Obtener todos los enlaces del sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-menu li a:not(.logout-link)');
    
    // Mapeo de textos a rutas
    const linkTextToRoute = {
        'Carrito': 'carrito',
        'Mis Pedidos': 'pedidos',
        'Historial': 'historial',
        'Lista de Deseos': 'deseos',
        'Reembolsos': 'reembolsos',
        'Valoraciones': 'valoraciones',
        'Mensajes': 'mensajes',
        'Perfil': 'perfil',
        'Vender': 'vender',
        'Soporte': 'soporte',
        'Configuración': 'configuracion'
    };

    // Asignar eventos de clic a cada enlace
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el texto del enlace
            const linkText = this.querySelector('.sidebar-text').textContent.trim();
            
            // Obtener la ruta correspondiente
            const routeKey = linkTextToRoute[linkText];
            const route = routes[routeKey];
            
            if (route) {
                // Remover clase 'active' de todos los enlaces
                sidebarLinks.forEach(l => l.classList.remove('active'));
                
                // Agregar clase 'active' al enlace clickeado
                this.classList.add('active');
                
                // Navegar a la página
                window.location.href = route;
            } else {
                console.warn(`Ruta no encontrada para: ${linkText}`);
            }
        });
    });

    // Marcar como activo el enlace de la página actual
    markActiveLink();

    // ============================================
    // TOGGLE SIDEBAR (MÓVIL)
    // ============================================
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', function() {
            document.body.classList.remove('sidebar-collapsed');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // ============================================
    // CERRAR SESIÓN
    // ============================================
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                // TODO: Implementar lógica de cierre de sesión
                console.log('Cerrando sesión...');
                
                // Redirigir al login
                window.location.href = '/pages/login.html';
            }
        });
    }
});

// ============================================
// MARCAR ENLACE ACTIVO SEGÚN PÁGINA ACTUAL
// ============================================
function markActiveLink() {
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-menu li a:not(.logout-link)');
    
    // Mapeo inverso: de ruta a texto
    const routeToText = {
        '/pages/dashboard_CARRITO.html': 'Carrito',
        '/pages/dashboard_PEDIDOS.html': 'Mis Pedidos',
        '/pages/dashboard_HISTORIAL.html': 'Historial',
        '/pages/dashboard_DESEOS.html': 'Lista de Deseos',
        '/pages/dashboard_REEMBOLSO.html': 'Reembolsos',
        '/pages/dashboard_VALORACIONES.html': 'Valoraciones',
        '/pages/dashboard_MENSAJES.html': 'Mensajes',
        '/pages/dashboard_PERFIL.html': 'Perfil',
        '/pages/dashboard_VENDER.html': 'Vender',
        '/pages/dashboard_SOPORTE.html': 'Soporte',
        '/pages/dashboard_CONFIGURACION.html': 'Configuración'
    };
    
    const currentPageText = routeToText[currentPath];
    
    if (currentPageText) {
        sidebarLinks.forEach(link => {
            const linkText = link.querySelector('.sidebar-text').textContent.trim();
            
            if (linkText === currentPageText) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}