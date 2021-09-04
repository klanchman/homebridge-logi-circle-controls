import crypto from 'crypto'
import os from 'os'
import path from 'path'

import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'

import { AccountManager } from '../../common/AccountManager'
import { JWT } from '../../common/JWT'
import { LogiAuthService } from '../../common/LogiAuthService'

export class Login extends Command {
  static description = 'Log in with your Logitech account to connect cameras'

  static flags = {
    homebridgeDir: flags.string({
      char: 'd',
      default: path.join(os.homedir(), '.homebridge'),
      description: 'The path to your Homebridge directory',
    }),
    verbose: flags.boolean({
      char: 'v',
    }),
  }

  myLog = {
    debug: (message: string, ...params: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { flags } = this.parse(Login)

      if (!flags.verbose) {
        return
      }

      this.log(message, ...params)
    },
    error: (message: string, ...params: unknown[]) =>
      this.log(message, ...params),
    info: (message: string, ...params: unknown[]) =>
      this.log(message, ...params),
  }

  async run() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { flags } = this.parse(Login)

    const accountManager = new AccountManager(flags.homebridgeDir)
    await accountManager.getAllAccounts() // Check that the path is OK

    const codeVerifier = makeCodeVerifier()
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest()
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    const loginURL = new URL('https://id.logi.com')
    loginURL.searchParams.append('client_id', LogiAuthService.clientId)
    loginURL.searchParams.append('scope', 'circle:all')
    loginURL.searchParams.append('response_type', 'code')
    loginURL.searchParams.append('redirect_uri', LogiAuthService.redirectURI)
    loginURL.searchParams.append('code_challenge_method', 'S256')
    loginURL.searchParams.append('code_challenge', codeChallenge)

    this.myLog.info('Your browser will open to log into your Logitech account')

    await cli.anykey()

    await cli.open(loginURL.toString())

    this.myLog.info(
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

    const authService = new LogiAuthService(this.myLog)

    const tokenResponse = await authService.exchangeAuthCodeForCredentials(
      code,
      codeVerifier,
    )

    const accessToken = new JWT(tokenResponse.access_token)

    await accountManager.setAccount(accessToken.payload.sub, {
      accessToken: accessToken,
      codeVerifier,
      refreshToken: tokenResponse.refresh_token,
    })

    this.myLog.info('\nLogged in successfully')
  }
}

const makeCodeVerifier = (length = 43) => {
  const randBank = [
    () => crypto.randomInt(0x41, 0x5a), // A-Z
    () => crypto.randomInt(0x61, 0x7a), // a-z
    () => crypto.randomInt(0x30, 0x39), // 0-9
  ]

  const chars = []

  for (let i = 0; i < length; i++) {
    chars.push(randBank[crypto.randomInt(0, randBank.length - 1)]())
  }

  return Buffer.from(chars).toString('ascii')
}
