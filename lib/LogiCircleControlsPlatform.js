const LogiService = require('./LogiService')
const parseConfig = require('./utils/parseConfig')
const Camera = require('./accessories/Camera')

let Service, Characteristic, packageInfo

module.exports = function(injectedInformation) {
  if (!Service) {
    Service = injectedInformation.Service
    Characteristic = injectedInformation.Characteristic
    packageInfo = injectedInformation.packageInfo
  }
  return LogiCircleControls
}

class LogiCircleControls {
  constructor(log, config, api) {
    this._log = log
    this._rawConfig = config
  }

  async accessories(callback) {
    this._log('Loading accessories...')

    try {
      this.config = await parseConfig(this._rawConfig, this._log)
    } catch (err) {
      this._log.error(`Error reading config: ${err.message}`)
      process.exit(1)
    }

    this.logiService = new LogiService(
      {
        email: this.config.email,
        password: this.config.password,
      },
      this._log,
    )

    const accessories = this.config.accessories.map(
      accessory =>
        new Camera({
          packageInfo,
          Service,
          Characteristic,
          config: accessory,
          logiService: this.logiService,
          log: this._log,
        }),
    )

    callback(accessories)
  }
}
