import axios, {
    type AxiosInstance
} from 'axios'

const http: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
        'content-type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000
})

export default http