//==============================
// LIBRERÍA SOCKET.IO
//==============================

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado:', socket.id);

    // Escuchar evento de registro enviado desde el frontend
    socket.on('usuario:registrado', (data) => {
      console.log('Usuario registrado vía socket:', data);

      // Enviar notificación a TODOS los demás usuarios conectados
      socket.broadcast.emit('notificacion:nueva', {
        tipo: 'registro',
        mensaje: `Nuevo usuario registrado: ${data.nombre}`
      });

      // Enviar bienvenida directa al usuario registrado
      socket.emit('notificacion:nueva', {
        tipo: 'bienvenida',
        mensaje: `¡Bienvenido, ${data.nombre}!`
      });
    });

    // Escuchar evento de login manual (opcional)
    socket.on('usuario:login', (data) => {
      console.log('Usuario inició sesión vía socket:', data);

      // Notificar a otros usuarios (si aplica)
      socket.broadcast.emit('notificacion:nueva', {
        tipo: 'login',
        mensaje: `${data.nombre} ha iniciado sesión`
      });
    });

    // Escuchar evento de nuevo pedido (ejemplo)
    socket.on('pedido:nuevo', (pedido) => {
      console.log('Pedido recibido vía socket:', pedido);

      // Notificar al área logística (puedes filtrar por rol si implementas eso)
      io.emit('notificacion:nueva', {
        tipo: 'pedido',
        mensaje: `Nuevo pedido de ${pedido.cliente}: ${pedido.producto}`
      });
    });

    // Desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};
