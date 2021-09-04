import type {
  API,
  AccessoryPlugin,
  Logging,
  PlatformConfig,
  StaticPlatformPlugin,
} from 'homebridge'

import { LogiService } from './LogiService'
import { Camera } from './accessories/Camera'
import { AccountManager } from './common/AccountManager'
import { Config, parseConfig } from './utils/Config'

export class LogiCircleControlsPlatform implements StaticPlatformPlugin {
  private config!: Config

  constructor(
    private readonly log: Logging,
    private readonly rawConfig: PlatformConfig,
    private readonly api: API,
  ) {}

  async accessories(callback: (foundAccessories: AccessoryPlugin[]) => void) {
    this.log.info('Loading accessories...')

    try {
      this.config = await parseConfig(this.rawConfig)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      this.log.error(`Error reading config: ${msg}`)
      process.exit(1)
    }

    const acctMgr = new AccountManager(this.api.user.storagePath())
    const accounts = await acctMgr.getAllAccounts()
    const firstAcct = Object.keys(accounts)[0]
    if (!firstAcct) {
      // FIXME: Better error message
      throw new Error('You are not logged into any accounts')
    }

    // FIXME: Use all accounts, not just first
    const logiService = new LogiService(firstAcct, this.api, this.log)

    const accessories = this.config.accessories.map(
      accessory => new Camera(this.api, this.log, accessory, logiService),
    )

    callback(accessories)
  }
}
