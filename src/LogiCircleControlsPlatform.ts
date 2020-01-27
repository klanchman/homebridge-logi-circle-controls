import { Camera } from './accessories/Camera'
import LogiService from './LogiService'
import { Config, parseConfig } from './utils/Config'
import { Logger } from './utils/Logger'
import { PackageInfo } from './utils/PackageInfo'

export class LogiCircleControlsPlatform implements Homebridge.Platform {
  private config!: Config
  private rawConfig: object

  constructor(logger: Homebridge.Logger, config: object) {
    Logger.configure(logger)
    this.rawConfig = config
  }

  async accessories(callback: (accessories: Homebridge.Accessory[]) => void) {
    Logger.shared.log('Loading accessories...')

    try {
      this.config = await parseConfig(this.rawConfig)
    } catch (err) {
      Logger.shared.error(`Error reading config: ${err.message}`)
      process.exit(1)
    }

    const logiService = new LogiService(
      {
        email: this.config.email,
        password: this.config.password,
      },
      Logger.shared,
      PackageInfo,
    )

    const accessories = this.config.accessories.map(
      accessory => new Camera(accessory, logiService),
    )

    callback(accessories)
  }
}
