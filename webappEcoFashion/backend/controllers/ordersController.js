const pedidosHistorial = [
    {
        id: "ORD-2025-001",
        fecha: "15 de Octubre, 2025",
        total: "S/ 50.00",
        estado: "Entregado",
        productos: [
            "Polo rojo suave",
            "Blusa de seda blanca"
        ]
    },
    {
        id: "ORD-2025-002",
        fecha: "20 de Octubre, 2025",
        total: "S/ 20.00",
        estado: "Enviado",
        productos: [
            "Vestido rojo estampado de Minnie",
        ]
    },
    {
        id: "ORD-2025-003",
        fecha: "25 de Octubre, 2025",
        total: "S/ 65.00",
        estado: "Procesando",
        productos: [
            "Pantalón para niños azul jean",
            "Polo de Minnie +",
            "Gorra de Minnie +"
        ]
    }
];

exports.getOrdersByEstado = (req, res) => {
    const estado = req.query.estado;
    console.log('Estado recibido:', estado); // ✅ útil para depurar

    if (!estado || estado === 'todos') {
        return res.json(pedidosHistorial); // ✅ devuelve todos los pedidos
    }

    const equivalencias = {
        entregados: 'Entregado',
        enviados: 'Enviado',
        procesando: 'Procesando',
        cancelados: 'Cancelado'
    };

    const estadoFiltrar = equivalencias[estado.toLowerCase()] || estado;
    const filtrados = pedidosHistorial.filter(p => p.estado === estadoFiltrar);

    res.json(filtrados); // ✅ devuelve los pedidosHistorial filtrados
};
