//centraliza la configuración de Axios fetch()-> axios
// baseURL, timeout, headers, interceptores

//¿En qué se diferencia con config.js?:
// - Acá se usa la tecnología base de Fetch API(fetch), en cambio, axios.config.js usa de tecnología base Axios(axios.create)
// - Acá no hay intercepción automática, es decir, hay un manejo manual en cada llamada, en cambio en axios.config.js sí hay (interceptors.response.use)
// - No hay soporte para cancelación, en cambio en axios.config.js sí hay-> CancelToken
// - Es más simple, pero menos flexible, axios.config.js es más robusto para headers dinámicos, tokens
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const mensaje = error.response?.data?.message || error.message;
    console.error('Error global de Axios:', mensaje);
    alert(`Error en la petición: ${mensaje}`);
    return Promise.reject(error);
  }
);

// Hacerlo accesible globalmente
window.axiosInstance = axiosInstance;
