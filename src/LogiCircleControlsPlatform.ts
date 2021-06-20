import type {
  AccessoryPlugin,
  API,
  Logging,
  PlatformConfig,
  StaticPlatformPlugin,
} from 'homebridge'
import { Camera } from './accessories/Camera'
import { LogiService } from './LogiService'
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
      this.log.error(`Error reading config: ${err.message}`)
      process.exit(1)
    }

    const logiService = new LogiService(
      {
        email: this.config.email,
        password: this.config.password,
      },
      this.log,
    )

    const accessories = this.config.accessories.map(
      accessory => new Camera(this.api, this.log, accessory, logiService),
    )

    callback(accessories)
  }
}
