import got, { CancelableRequest, Options, RequestError, Response } from 'got'
import type { Logging } from 'homebridge'
import { PackageInfo } from './utils/PackageInfo'

export interface AccessoryConfiguration {
  ledEnabled: boolean
  nightVisionIrLedsEnabled: boolean
  nightVisionMode: 'auto' | 'off'
  privacyMode: boolean
  streamingMode: 'onAlert' | 'off'
}

export interface AccessoryResponse {
  configuration: AccessoryConfiguration
}

interface Credentials {
  email: string
  password: string
}

interface PendingRequests {
  authenticate?: Promise<string>
  getAccessory?: Promise<AccessoryResponse>
}

export class LogiService {
  private static logiBaseUrl = 'https://video.logi.com/api/'
  private static logiAuthHeader = 'x-logi-auth'

  private static initialCooldownSecs = 30
  private static cooldownIncreaseFactor = 2
  private static consecutiveFailuresAllowed = 3

  private client
  private isAuthenticated = false

  private consecutiveFailures = 0
  private cooldownTimeout: NodeJS.Timeout | undefined
  private cooldownSecs = LogiService.initialCooldownSecs
  private isCoolingDown = false

  private pendingRequests: PendingRequests = {}

  constructor(
    private readonly credentials: Credentials,
    private readonly log: Logging,
  ) {
    this.client = got.extend({
      prefixUrl: LogiService.logiBaseUrl,
      headers: {
        // TODO: Use /api/info endpoint to get min supported UA
        'user-agent': 'iOSClient/3.4.5.31',
        'x-actual-user-agent': `homebridge-logi-circle-controls/${PackageInfo.version}`,
      },
      hooks: {
        afterResponse: [
          response => {
            this.log.debug(
              `Incoming response: ${response.request.options.method} ${response.requestUrl} - ${response.statusCode}`,
            )

            return response
          },
          this.successfulRequestCooldownHook.bind(this),
          this.unauthorizedRequestHook.bind(this),
        ],
        beforeError: [
          error => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.log.error(`Error processing request: ${error}`)
            return error
          },
          this.failedRequestCooldownHook.bind(this),
        ],
        beforeRequest: [
          request => {
            this.log.debug(
              `Outgoing request: ${request.method} ${request.url.toString()}`,
            )
          },
        ],
      },
    })
  }

  /**
   * Gets info about the specified accessory
   *
   * @param id the accessory's id
   * @returns a Promise that resolves to the accessory info
   */
  async getAccessoryInfo(id: string): Promise<AccessoryResponse> {
    await this.doPrechecks()

    return this.joinRequest('getAccessory', () =>
      this.client.get(`accessories/${id}`).json<AccessoryResponse>(),
    )
  }

  /**
   * Updates accessory configuration
   *
   * @param id the id of the accessory to update
   * @param options the configuration to change on the accessory
   * @returns a Promise that resolves when the update is complete
   */
  async updateAccessory(id: string, options: Partial<AccessoryConfiguration>) {
    await this.doPrechecks()
    return this.client.put(`accessories/${id}`, {
      json: options,
    })
  }

  private async doPrechecks() {
    this.throwIfCoolingDown()

    if (!this.isAuthenticated) {
      await this.authenticate()
    }
  }

  /**
   * Joins the caller to a request already in progress, or starts making the
   * request if there isn't one in progress already
   *
   * @param name the name of the request
   * @param makeRequest a function that makes the request
   * @returns a Promise that resolves to the result expected for the request
   */
  private joinRequest<
    Name extends keyof PendingRequests,
    TRequest extends Required<PendingRequests>[Name],
  >(name: Name, makeRequest: () => TRequest): TRequest {
    // TODO: How to avoid type casting in here?

    if (this.pendingRequests[name]) {
      return this.pendingRequests[name] as TRequest
    } else {
      const req = makeRequest().then(r => {
        this.pendingRequests[name] = undefined
        return r
      }) as TRequest

      this.pendingRequests[name] = req
      return req
    }
  }

  /**
   * Authenticates with Logitech's API and updates client headers with the
   * returned auth token
   *
   * @returns a Promise that resolves to the received auth token
   */
  private authenticate() {
    this.throwIfCoolingDown()

    return this.joinRequest('authenticate', async () => {
      const response = await this.client.post('accounts/authorization', {
        json: this.credentials,
      })

      const authToken = response.headers[LogiService.logiAuthHeader]

      if (typeof authToken !== 'string') {
        this.isAuthenticated = false
        throw new Error('Authenticated but did not receive an auth token')
      }

      this.isAuthenticated = true

      this.client = this.client.extend({
        headers: {
          [LogiService.logiAuthHeader]: authToken,
        },
      })

      return authToken
    })
  }

  /**
   * Success hook for the client
   *
   * Resets cooldown values to defaults
   */
  private successfulRequestCooldownHook(response: Response): Response {
    this.consecutiveFailures = 0
    this.cooldownSecs = LogiService.initialCooldownSecs
    return response
  }

  /**
   * Error hook for the client
   *
   * Handles logic related to cooldown to prevent flooding Logitech with
   * requests that will likely fail
   */
  private failedRequestCooldownHook(error: RequestError): RequestError {
    this.consecutiveFailures += 1
    this.log.warn('Failure', this.consecutiveFailures)

    if (this.consecutiveFailures < LogiService.consecutiveFailuresAllowed) {
      return error
    }

    this.log.warn('Cooling down for', this.cooldownSecs, 'seconds')

    this.isCoolingDown = true

    if (this.cooldownTimeout) {
      clearTimeout(this.cooldownTimeout)
    }

    this.cooldownTimeout = setTimeout(() => {
      this.isCoolingDown = false
    }, this.cooldownSecs * 1000)

    this.cooldownSecs *= LogiService.cooldownIncreaseFactor

    return error
  }

  /**
   * Error hook for the client
   *
   * If response has 401 status, the hook will re-authenticate and try the
   * request again. If the request fails again, it will not be retried.
   *
   * If a request fails for a reason other than a 401 response, the hook does
   * not do anything with it.
   */
  private async unauthorizedRequestHook(
    response: Response,
    retry: (options: Options) => CancelableRequest<Response>,
  ) {
    if (response.statusCode !== 401) {
      return response
    }

    if (response.request.options.context.isAuthRetry) {
      throw new Error('Request failed again after re-authentication')
    }

    this.log.info('Received a 401, re-authenticating and trying again')

    const authToken = await this.authenticate()

    return retry({
      headers: {
        [LogiService.logiAuthHeader]: authToken,
      },
      context: {
        isAuthRetry: true,
      },
    })
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
