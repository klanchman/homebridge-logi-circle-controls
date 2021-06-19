import axios, { AxiosInstance, Method } from 'axios'
import type { Logging } from 'homebridge'
import { PackageInfo } from './utils/PackageInfo'

interface Credentials {
  email: string
  password: string
}

export class LogiService {
  private static logiBaseUrl = 'https://video.logi.com/api/'
  private static logiAuthHeader = 'x-logi-auth'

  private static initialCooldownSecs = 30
  private static cooldownIncreaseFactor = 2
  private static consecutiveFailuresAllowed = 3

  private axios: AxiosInstance
  private isAuthenticated = false

  private consecutiveFailures = 0
  private cooldownSecs = LogiService.initialCooldownSecs
  private isCoolingDown = false

  constructor(
    private readonly credentials: Credentials,
    private readonly log: Logging,
  ) {
    this.axios = axios.create({
      baseURL: LogiService.logiBaseUrl,
      headers: {
        'user-agent': 'iOSClient/3.4.5.31',
        'x-actual-user-agent': `homebridge-logi-circle-controls/${PackageInfo.version}`,
      },
    })

    this.axios.interceptors.response.use(response =>
      this.successfulRequestCooldownInterceptor(response),
    )

    this.axios.interceptors.response.use(undefined, err =>
      this.failedRequestCooldownInterceptor(err),
    )

    this.axios.interceptors.response.use(undefined, err =>
      this.unauthorizedRequestInterceptor(err),
    )
  }

  /**
   * Make an HTTP request to the specified endpoint
   *
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} [body] - Request body
   */
  async request(method: Method, endpoint: string, body: any = undefined) {
    this.throwIfCoolingDown()

    if (!this.isAuthenticated) {
      await this.authenticate()
    }

    try {
      return this.axios.request({
        method,
        url: endpoint,
        data: body,
      })
    } catch (error) {
      this.logAxiosError(error)
      throw error
    }
  }

  /**
   * Authenticates with Logitech's API and updates Axios headers with the
   * returned auth token
   * @throws
   * @returns Promise that resolves to the received auth token
   */
  private async authenticate() {
    this.throwIfCoolingDown()

    let response
    try {
      response = await this.axios.post('accounts/authorization', {
        ...this.credentials,
      })
    } catch (error) {
      this.logAxiosError(error)
      throw error
    }

    const authToken = response.headers[LogiService.logiAuthHeader]

    if (!authToken) {
      this.isAuthenticated = false
      throw new Error('Authenticated but did not receive an auth token')
    }

    this.isAuthenticated = true

    this.axios.defaults.headers = {
      ...this.axios.defaults.headers,
      [LogiService.logiAuthHeader]: authToken,
    }

    return authToken
  }

  /**
   * Success interceptor for Axios
   *
   * Resets cooldown values to defaults
   *
   * @param {Object} response response received by Axios
   */
  private async successfulRequestCooldownInterceptor(response: any) {
    this.consecutiveFailures = 0
    this.cooldownSecs = LogiService.initialCooldownSecs
    return Promise.resolve(response)
  }

  /**
   * Error interceptor for Axios
   *
   * Handles logic related to cooldown to prevent flooding Logitech with
   * requests that will likely fail
   *
   * @param {Object} error error intercepted from Axios
   */
  private async failedRequestCooldownInterceptor(error: any) {
    this.consecutiveFailures += 1
    this.log('Failure', this.consecutiveFailures)

    if (this.consecutiveFailures < LogiService.consecutiveFailuresAllowed) {
      return Promise.reject(error)
    }

    this.log('Cooling down for', this.cooldownSecs, 'seconds')

    this.isCoolingDown = true

    setTimeout(() => {
      this.isCoolingDown = false
    }, this.cooldownSecs * 1000)

    this.cooldownSecs *= LogiService.cooldownIncreaseFactor

    return Promise.reject(error)
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
  private async unauthorizedRequestInterceptor(error: any) {
    if (
      !error.response ||
      error.response.status !== 401 ||
      !error.response.config
    ) {
      return Promise.reject(error)
    }

    if (error.response.config.__isAuthRetry) {
      this.log('Request failed again after re-authentication')
      return Promise.reject(error)
    }

    this.log('Received a 401, re-authenticating and trying again')
    error.response.config.__isAuthRetry = true

    const authToken = await this.authenticate()

    // This is necessary when debugging with a proxy, not sure otherwise
    delete error.config.httpsAgent

    error.config.headers[LogiService.logiAuthHeader] = authToken
    return this.axios.request(error.config)
  }

  /**
   * Logs an error thrown by Axios
   * @param {Object} error error from Axios
   */
  private logAxiosError(error: any) {
    this.log('Error processing request')
    if (error.response) {
      this.log(`Server returned status ${error.response.status}`)
    } else if (error.request) {
      this.log('No response received')
    } else {
      this.log('Unknown error')
    }
  }

  private throwIfCoolingDown() {
    if (this.isCoolingDown) {
      this.log(
        'Refusing to send request, still cooling down after multiple failures',
      )
      throw new Error('Still cooling down')
    }
  }
}
