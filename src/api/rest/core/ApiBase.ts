import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export default class ApiBase {
  private readonly api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    this.api.interceptors.response.use(ApiBase.handleResponse, ApiBase.handleError)
  }

  protected request<T>(config: AxiosRequestConfig): Promise<T> {
    return this.api.request(config)
  }

  protected get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get(url, config)
  }

  protected delete(url: string, config?: AxiosRequestConfig): Promise<void> {
    return this.api.delete(url, config)
  }

  protected head(url: string, config?: AxiosRequestConfig): Promise<void> {
    return this.api.head(url, config)
  }

  protected post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post(url, data, config)
  }

  protected put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put(url, data, config)
  }

  protected patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.api.patch(url, data, config)
  }

  private static handleResponse<T>(response: AxiosResponse<T>) {
    return response.data
  }

  private static handleError(error: AxiosError<Error>) {
    return Promise.reject(error)
  }
}
