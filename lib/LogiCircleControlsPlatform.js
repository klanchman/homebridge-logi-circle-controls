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

    this.config = parseConfig(config, this._log)

    this.logiService = new LogiService(
      {
        email: this.config.email,
        password: this.config.password,
      },
      this._log,
    )
  }

  accessories(callback) {
    this._log('Loading accessories...')

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
