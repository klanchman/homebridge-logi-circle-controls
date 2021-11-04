import got from 'got'

import { PackageInfo } from '../utils/PackageInfo'

import { AccountInfo } from './AccountManager'

export class LogiAuthService {
  // From Logi Circle iOS app
  static clientId = '0499da51-621f-443f-84dc-5064f631f0d0'
  // From Logi Circle iOS app - arbitrary URLs are not allowed
  static redirectURI = 'com.logitech.Circle://lids'

  private client

  constructor(private readonly log: SimpleLogging) {
    this.client = got.extend({
      prefixUrl: 'https://accounts.logi.com/',
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
        ],
        beforeError: [
          error => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.log.error(`Error processing request: ${error}`)
            return error
          },
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

  async exchangeAuthCodeForCredentials(
    authorizationCode: string,
    codeVerifier: string,
  ) {
    return this.client
      .post('identity/oauth2/token', {
        form: {
          grant_type: 'authorization_code',
          client_id: LogiAuthService.clientId,
          code_verifier: codeVerifier,
          code: authorizationCode,
          redirect_uri: LogiAuthService.redirectURI,
        },
      })
      .json<Credentials>()
  }

  async refreshCredentials(account: AccountInfo) {
    return this.client
      .post('identity/oauth2/token', {
        form: {
          grant_type: 'refresh_token',
          client_id: LogiAuthService.clientId,
          refresh_token: account.refreshToken,
          code_verifier: account.codeVerifier,
        },
      })
      .json<Credentials>()
  }
}

interface Credentials {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token: string
}

interface SimpleLogging {
  debug(message: string, ...parameters: unknown[]): void
  error(message: string, ...parameters: unknown[]): void
}
