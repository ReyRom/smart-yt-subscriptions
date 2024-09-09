import axios from 'axios'

export const axiosClientV1 = axios.create({
  baseURL: (process.env.NODE_ENV === 'production' 
    ? "https://www.syts-backend.ru/" 
    : "https://localhost:7150") + "/api/v1"
});

export const axiosGoogle = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3/",
});
