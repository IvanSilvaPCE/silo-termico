import axios from 'axios'
import router from './router'

const authHeader = () => {
    const token = localStorage.getItem('token') || ''
    return token ? `Bearer ${token}` : ''
}

const url = window.location.href
const urlObj = new URL(url)
const ipAddress = urlObj.hostname
const protocol = urlObj.protocol

const client = axios.create({
    baseURL: `${protocol}//${ipAddress}/cloud/api/public/api/`,
    
    transformRequest: [function (data, headers) {
        headers.Authorization = authHeader()
        // return JSON.stringify(data)
        return data
    }],
    headers: {
        'Content-Type': 'application/json'
    }
})

client.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
    }
    return Promise.reject(error)
})

export default client