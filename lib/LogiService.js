// @ts-check

const axios = require('axios').default

const _logiBaseUrl = 'https://video.logi.com/api/'
const _logiAuthHeader = 'x-logi-auth'

class LogiService {
  constructor(credentials, log) {
    this._axios = axios.create({
      baseURL: _logiBaseUrl,
    })

    this._axios.interceptors.response.use(undefined, err =>
      this._unauthorizedRequestInterceptor(err),
    )

    this._credentials = credentials
    this._log = log

    this._isAuthenticated = false
  }

  /**
   * Make an HTTP request to the specified endpoint
   *
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} [body] - Request body
   */
  async request(method, endpoint, body) {
    if (!this._isAuthenticated) {
      await this._authenticate()
    }

    try {
      return this._axios.request({
        method,
        url: endpoint,
        data: body,
      })
    } catch (error) {
      this._logAxiosError(error)
      throw error
    }
  }

  /**
   * Authenticates with Logitech's API and updates Axios headers with the
   * returned auth token
   * @throws
   * @returns Promise that resolves to the received auth token
   */
  async _authenticate() {
    const response = await this._axios.post('accounts/authorization', {
      ...this._credentials,
    })

    const authToken = response.headers[_logiAuthHeader]

    if (!authToken) {
      this._isAuthenticated = false
      throw new Error('Authenticated but did not receive an auth token')
    }

    this._isAuthenticated = true

    this._axios.defaults.headers = {
      [_logiAuthHeader]: authToken,
    }

    return authToken
  }

  /**
   * Error interceptor for Axios
   *
   * If response has 401 status, the interceptor will re-authenticate and try
   * the request again. If the request fails again, it will not be retried.
   *
   * If a request fails for a reason other than a 401 response, the interceptor
   * does not do anything with it.
   * @param {Object} error error intercepted from Axios
   */
  async _unauthorizedRequestInterceptor(error) {
    if (
      !error.response ||
      error.response.status !== 401 ||
      !error.response.config
    ) {
      return Promise.reject(error)
    }

    if (error.response.config.__isAuthRetry) {
      this._log('Request failed again after re-authentication')
      return Promise.reject(error)
    }

    this._log('Received a 401, re-authenticating and trying again')
    error.response.config.__isAuthRetry = true

    const authToken = await this._authenticate()

    // This is necessary when debugging with a proxy, not sure otherwise
    delete error.config.httpsAgent

    error.config.headers[_logiAuthHeader] = authToken
    return this._axios.request(error.config)
  }

  /**
   * Logs an error thrown by Axios
   * @param {Object} error error from Axios
   */
  _logAxiosError(error) {
    this._log('Error processing request')
    if (error.response) {
      this._log(`Server returned status ${error.response.status}`)
    } else if (error.request) {
      this._log('No response received')
    } else {
      this._log('Unknown error')
    }
  }
}

module.exports = LogiService
