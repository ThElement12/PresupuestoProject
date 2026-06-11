const API_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('usuario');
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ msg: 'Error del servidor' }));
    throw new Error(error.msg || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (correo, pass) => request('/login', {
    method: 'POST',
    body: JSON.stringify({ correo, pass }),
  }),
  register: (nombre, correo, pass) => request('/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, correo, pass }),
  }),

  getConfig: () => request('/config'),
  updateConfig: (tasa_dolar) => request('/config', {
    method: 'PUT',
    body: JSON.stringify({ tasa_dolar }),
  }),

  getDashboard: (usuarioId, periodoId) => {
    const params = periodoId ? `?periodo_id=${periodoId}` : '';
    return request(`/dashboard/${usuarioId}${params}`);
  },
  getMeses: (usuarioId) => request(`/mes-usuario/${usuarioId}`),
  getMes: (id) => request(`/mes/${id}`),
  crearMes: (data) => request('/nuevo-mes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  borrarMes: (id) => request(`/borrar_mes/${id}`, { method: 'DELETE' }),

  getPeriodos: (mesId) => request(`/periodo/${mesId}`),
  getPeriodo: (id) => request(`/periodo/single/${id}`),
  crearPeriodo: (data) => request('/nuevo_periodo', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  editarPeriodo: (id, data) => request(`/editar_periodo/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  borrarPeriodo: (id) => request(`/borrar_periodo/${id}`, { method: 'DELETE' }),

  getMovimientos: (periodoId) => request(`/movimiento/${periodoId}`),
  crearMovimiento: (data) => request('/nuevo_movimiento', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  editarMovimiento: (id, data) => request(`/editar_movimiento/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  borrarMovimiento: (id) => request(`/borrar_movimiento/${id}`, { method: 'DELETE' }),
  getTiposMovimiento: () => request('/tipo-movimiento'),

  getMetodos: (usuarioId) => request(`/metodo/${usuarioId}`),
  crearMetodo: (data) => request('/nuevo_metodo', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  editarMetodo: (id, data) => request(`/editar_metodo/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  borrarMetodo: (id) => request(`/borrar_metodo/${id}`, { method: 'DELETE' }),
};
