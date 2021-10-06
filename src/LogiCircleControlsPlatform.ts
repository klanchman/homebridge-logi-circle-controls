import type {
  API,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge'

import { LogiService } from './LogiService'
import { Camera } from './accessories/Camera'
import { AccountManager } from './common/AccountManager'
import { Config, parseConfig } from './utils/Config'
import { PackageInfo } from './utils/PackageInfo'

export class LogiCircleControlsPlatform implements DynamicPlatformPlugin {
  private accessories: { [uuid: string]: Camera } = {}
  private config!: Config

  private cachedAccessories: PlatformAccessory[] = []

  constructor(
    private readonly log: Logging,
    private readonly rawConfig: PlatformConfig,
    private readonly api: API,
  ) {
    try {
      this.config = parseConfig(this.rawConfig)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      throw new Error(`Error reading config: ${msg}`)
    }

    this.api.on('didFinishLaunching', () => {
      if (this.cachedAccessories.length) {
        // TODO: Use the accessories that were cached?
        // Things seem to work fine if I don't, and it makes it so I don't have to
        // write as much code. Not sure that there's really a downside...
        this.log.info(
          `Resetting cached accessories (${this.cachedAccessories.length})`,
        )

        this.api.unregisterPlatformAccessories(
          PackageInfo.identifier,
          PackageInfo.platformName,
          this.cachedAccessories,
        )

        this.cachedAccessories = []
      }

      this.loadRemoteAccessories().catch(err => {
        const msg = err instanceof Error ? err.message : 'unknown error'
        this.log.info(`Could not load remote accessories: ${msg}`)
      })
    })
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info(
      `Found cached accessory "${accessory.displayName}" (${accessory.UUID})`,
    )
    this.cachedAccessories.push(accessory)
  }

  private async loadRemoteAccessories() {
    this.log.info('Loading remote accessories...')

    const acctMgr = new AccountManager(this.api.user.storagePath())
    const accounts = await acctMgr.getAllAccounts()
    const accountIds = Object.keys(accounts)

    if (accountIds.length < 1) {
      throw new Error(
        'You are not logged into any accounts. Check the README to learn how to set up the plugin.',
      )
    }

    await Promise.all(
      accountIds.map(async accountId => {
        const logiService = new LogiService(accountId, this.api, this.log)

        const rawAccessories = await logiService.getAllAccessories()

        rawAccessories.forEach(a => {
          const c = new Camera(
            a.accessoryId,
            a.name,
            this.config,
            this.api,
            this.log,
            logiService,
          )

          if (this.accessories[c.uuid]) {
            return
          }

          this.accessories[c.uuid] = c
        })
      }),
    )

    this.api.registerPlatformAccessories(
      PackageInfo.identifier,
      PackageInfo.platformName,
      Object.values(this.accessories).map(a => a.accessory),
    )

    this.log.info('Loaded remote accessories successfully')
  }
}
