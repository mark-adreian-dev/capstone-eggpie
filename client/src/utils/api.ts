import axios from 'axios'

const isMobileTesting = false
const isProduction = false
const api = axios.create({
  baseURL: `${isProduction ? "https://sampleDomain.online" : isMobileTesting ? "http://192.168.0.100:8000" : "http://127.0.0.1:8000"}`,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
})

export const setAuthToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const resetAuthToken = () => {
  api.defaults.headers.common.Authorization = ''
}

export default api