import crypto from 'crypto'
import os from 'os'
import path from 'path'

import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import got from 'got'

export class Login extends Command {
  static description = 'Log in with your Logitech account to connect cameras'

  static flags = {
    homebridgeDir: flags.string({
      char: 'd',
      default: path.join(os.homedir(), '.homebridge'),
    }),
  }

  // From Logi Circle iOS app
  private static clientId = '0499da51-621f-443f-84dc-5064f631f0d0'
  // From Logi Circle iOS app - arbitrary URLs are not allowed
  private static redirectURI = 'com.logitech.Circle://lids'

  async run() {
    const { flags } = this.parse(Login)

    const codeVerifier = crypto.randomBytes(43).toString()
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest()
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    const loginURL = new URL('https://id.logi.com')
    loginURL.searchParams.append('client_id', Login.clientId)
    loginURL.searchParams.append('scope', 'circle:all')
    loginURL.searchParams.append('response_type', 'code')
    loginURL.searchParams.append('redirect_uri', Login.redirectURI)
    loginURL.searchParams.append('code_challenge_method', 'S256')
    loginURL.searchParams.append('code_challenge', codeChallenge)

    this.log('Your browser will open to log into your Logitech account')

    await cli.anykey()

    await cli.open(loginURL.toString())

    this.log(
      '\nOnce you log in, copy the URL you are sent to (starts with "com.logitech.Circle://lids") and paste it below',
    )

    const redirectURLStr = (await cli.prompt('Redirect URL')) as string

    let code: string

    try {
      const redirectURL = new URL(redirectURLStr)
      const maybeCode = redirectURL.searchParams.get('code')
      if (!maybeCode) {
        throw new Error()
      }
      code = maybeCode
    } catch (error) {
      throw new Error('Invalid redirect URL')
    }

    const tokenResponse = await got
      .post('https://accounts.logi.com/identity/oauth2/token', {
        form: {
          grant_type: 'authorization_code',
          client_id: Login.clientId,
          code_verifier: codeVerifier,
          code,
          redirect_uri: Login.redirectURI,
        },
      })
      .json<TokenResponse>()

    // FIXME: Store tokens in the homebridge dir
  }
}

interface TokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token: string
}
