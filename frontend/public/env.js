// Configuración runtime. En Docker, docker-entrypoint.sh sobrescribe este archivo
// con el valor de la variable de entorno API_URL antes de arrancar nginx.
window.__env = {
  apiUrl: 'http://localhost:3000'
};
