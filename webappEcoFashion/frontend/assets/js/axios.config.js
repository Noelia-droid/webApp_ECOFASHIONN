//centraliza la configuración de Axios fetch()-> axios

// frontend/assets/js/axios.config.js

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

// ✅ Hacerlo accesible globalmente
window.axiosInstance = axiosInstance;
