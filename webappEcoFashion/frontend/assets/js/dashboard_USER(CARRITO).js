// ============================================
    // CONFIGURACIÓN - CONEXIÓN A BASE DE DATOS
    // ============================================
    
    // Función para obtener el carrito del usuario desde la BD
    async function fetchCartFromDatabase(userId) {
      // TODO: Reemplazar con tu llamada real a la API/BD
      // Ejemplo:
      // const response = await fetch(`/api/cart/${userId}`);
      // const data = await response.json();
      // return data.items;
      
      // DEMO: Datos de ejemplo para visualizar el diseño
      return [
        {
          id: 1,
          name: "Chaqueta Vintage Denim",
          price: 35.99,
          quantity: 1,
          size: "M",
          condition: "Muy bueno",
          image: ""
        },
        {
          id: 2,
          name: "Vestido Floral Sostenible",
          price: 28.50,
          quantity: 2,
          size: "S",
          condition: "Como nuevo",
          image: ""
        }
      ];
    }

    // Función para actualizar cantidad en la BD
    async function updateCartItemQuantity(itemId, newQuantity) {
      // TODO: Reemplazar con tu llamada real a la API/BD
      console.log(`Actualizar item ${itemId} a cantidad ${newQuantity}`);
    }

    // Función para eliminar item de la BD
    async function removeCartItem(itemId) {
      // TODO: Reemplazar con tu llamada real a la API/BD
      console.log(`Eliminar item ${itemId} del carrito`);
    }

    // ============================================
    // LÓGICA DEL CARRITO
    // ============================================
    
    let cartItems = [];
    const userId = 1; // TODO: Obtener del usuario autenticado

    // Función para renderizar los items del carrito
    function renderCartItems() {
      const container = document.getElementById('cartItems');
      
      if (cartItems.length === 0) {
        container.innerHTML = `
          <div class="empty-cart">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.2 16.4H17M17 13V16.4M9 19C9 19.6 8.6 20 8 20C7.4 20 7 19.6 7 19C7 18.4 7.4 18 8 18C8.6 18 9 18.4 9 19ZM17 19C17 19.6 16.6 20 16 20C15.4 20 15 19.6 15 19C15 18.4 15.4 18 16 18C16.6 18 17 18.4 17 19Z" stroke="#7e7167" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Tu carrito está vacío</h3>
            <p>Agrega productos para comenzar tu compra</p>
          </div>
        `;
        return;
      }

      container.innerHTML = cartItems.map(item => `
        <article class="cart-item" data-item-id="${item.id}">
          <div class="item-image" style="${item.image ? `background-image: url(${item.image})` : ''}"></div>
          <div class="item-details">
            <h3>${item.name}</h3>
            <div class="tags">
              ${item.size ? `<span class="tag">Talla ${item.size}</span>` : ''}
              ${item.condition ? `<span class="tag">${item.condition}</span>` : ''}
            </div>
            <div class="price">S/ ${item.price.toFixed(2)}</div>
          </div>
          <div class="item-controls">
            <div class="icon-trash" onclick="handleRemoveItem(${item.id})">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6H5M5 6H17M5 6V16C5 16.6 5.4 17 6 17H14C14.6 17 15 16.6 15 16V6M7 6V4C7 3.4 7.4 3 8 3H12C12.6 3 13 3.4 13 4V6" stroke="#7e7167" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9V14" stroke="#7e7167" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 9V14" stroke="#7e7167" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="quantity">
              <div class="btn-minus" onclick="handleQuantityChange(${item.id}, -1)">-</div>
              <div class="qty">${item.quantity}</div>
              <div class="btn-plus" onclick="handleQuantityChange(${item.id}, 1)">+</div>
            </div>
          </div>
        </article>
      `).join('');
    }

    // Función para renderizar el resumen del pedido
    function renderOrderSummary() {
      const summaryContainer = document.getElementById('summaryItems');
      const totalElement = document.getElementById('totalPrice');
      const productCount = document.getElementById('productCount');
      const checkoutBtn = document.getElementById('checkoutBtn');

      if (cartItems.length === 0) {
        summaryContainer.innerHTML = '<p style="color: #7e7167; text-align: center;">No hay productos en el carrito</p>';
        totalElement.textContent = 'S/ 0.00';
        productCount.textContent = '0 productos';
        checkoutBtn.disabled = true;
        return;
      }

      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      summaryContainer.innerHTML = cartItems.map(item => `
        <div class="summary-line">
          <span>${item.name} (x${item.quantity})</span>
          <span>S/ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');

      totalElement.textContent = `S/ ${totalPrice.toFixed(2)}`;
      productCount.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
      checkoutBtn.disabled = false;
    }

    // Manejador para cambiar cantidad
    async function handleQuantityChange(itemId, delta) {
      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;

      const newQuantity = item.quantity + delta;
      if (newQuantity < 1) return;

      item.quantity = newQuantity;
      await updateCartItemQuantity(itemId, newQuantity);
      
      renderCartItems();
      renderOrderSummary();
    }

    // Manejador para eliminar item
    async function handleRemoveItem(itemId) {
      cartItems = cartItems.filter(i => i.id !== itemId);
      await removeCartItem(itemId);
      
      renderCartItems();
      renderOrderSummary();
    }

    // Manejador del botón de checkout
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      // TODO: Implementar lógica de checkout
      alert('Procesando compra...');
      console.log('Items a comprar:', cartItems);
    });

    // Inicializar carrito al cargar la página
    async function initializeCart() {
      try {
        cartItems = await fetchCartFromDatabase(userId);
        renderCartItems();
        renderOrderSummary();
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        document.getElementById('cartItems').innerHTML = `
          <div class="empty-cart">
            <h3>Error al cargar el carrito</h3>
            <p>Por favor, intenta de nuevo más tarde</p>
          </div>
        `;
      }
    }

    // Cargar carrito cuando la página esté lista
    initializeCart();
