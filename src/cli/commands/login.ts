import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import got from 'got'
import { lazy, object, string } from 'yup'

import { JWT } from '../../common/JWT'
import { mapRuleToKeys } from '../../common/ext/yup'

export class Login extends Command {
  static description = 'Log in with your Logitech account to connect cameras'

  static flags = {
    homebridgeDir: flags.string({
      char: 'd',
      default: path.join(os.homedir(), '.homebridge'),
      description: 'The path to your Homebridge directory',
    }),
  }

  private static authFilename = 'logi-circle-controls-auth.json'
  // From Logi Circle iOS app
  private static clientId = '0499da51-621f-443f-84dc-5064f631f0d0'
  // From Logi Circle iOS app - arbitrary URLs are not allowed
  private static redirectURI = 'com.logitech.Circle://lids'

  async run() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { flags } = this.parse(Login)

    const homebridgeDir = flags.homebridgeDir

    if (!fs.statSync(homebridgeDir).isDirectory()) {
      throw new Error(`Homebridge path '${homebridgeDir}' must be a directory`)
    }

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

    const accountId = JWT.fromString(
      tokenResponse.access_token,
      object({
        sub: string().required(),
      }),
    ).payload.sub

    const authFilePath = path.join(homebridgeDir, Login.authFilename)

    let config: AuthConfig

    if (fs.existsSync(authFilePath)) {
      const fileContents = fs.readFileSync(authFilePath)
      config = authConfigSchema.validateSync(
        JSON.parse(fileContents.toString()),
      )
    } else {
      config = {}
    }

    config[accountId] = {
      accessToken: tokenResponse.access_token,
      codeVerifier,
      refreshToken: tokenResponse.refresh_token,
    }

    fs.writeFileSync(authFilePath, JSON.stringify(config, undefined, 2))

    this.log('\nLogged in successfully')
  }
}

interface TokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token: string
}

const authConfigSchema = lazy(obj =>
  object(
    mapRuleToKeys(
      obj,
      object({
        accessToken: string().required(),
        codeVerifier: string().required(),
        refreshToken: string().required(),
      }).required(),
    ),
  ).required(),
)

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

type AuthConfig = Record<
  string,
  {
    accessToken: string
    codeVerifier: string
    refreshToken: string
  }
>
