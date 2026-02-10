import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_GATEWAY}/api/v1/storage` , 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hc_token');
  const apiKey = localStorage.getItem('active_api_key');
  const apiSecret = localStorage.getItem('active_api_secret');
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (apiKey) config.headers['X-API-Key'] = apiKey;
  if (apiSecret) config.headers['X-API-Secret'] = apiSecret;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    
  const token = localStorage.getItem('hc_token');
  console.log("Current Token in Interceptor:", token);
    // Agregamos este log para ver el error real en la consola antes del redirect
    console.error("API Error Object:", error.response);

    if (error.response && error.response.status === 401) {
      const currentUrl = window.location.href;
      
      // Si el token existe pero dio 401, el problema es la validación en el Backend
      console.warn("Token rejected by Gateway. Check JWT_SECRET in Go.");
      
      localStorage.removeItem('hc_token');
      console.log(window.location)
    //   if (!window.location.search.includes('token=')) {
    //     window.location.href = `http://localhost:5173/login?redirect=${encodeURIComponent(currentUrl)}`;
    //   }
    }
    return Promise.reject(error);
  }
);

export default apiClient;