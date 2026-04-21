import axios from 'axios'

// baseURL ends with / so axios appends paths correctly.
// In dev: Vite proxy forwards /api/* -> http://localhost:8000/api/*
// In prod: set VITE_API_BASE=https://your-backend.onrender.com in .env.local
const BASE = (import.meta.env.VITE_API_BASE || '') + '/api/'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('ss_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('ss_token')
    localStorage.removeItem('ss_user')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export default api
