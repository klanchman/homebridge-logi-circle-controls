const LogiService = require('./LogiService')
const validateConfig = require('./utils/validateConfig')
const PrivacyModeSwitch = require('./accessories/PrivacyModeSwitch')
const StreamingModeSwitch = require('./accessories/StreamingModeSwitch')
const LEDPowerSwitch = require('./accessories/LEDPowerSwitch')

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

    validateConfig(config)
    this.config = config

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

    const accessories = this.config.accessories.map(accessory => {
      const switchConfig = {
        name: accessory.name,
        deviceId: this.config.deviceId,
      }

      let SwitchClass
      switch (accessory.type) {
        case 'privacyMode':
          SwitchClass = PrivacyModeSwitch
          break
        case 'streamingMode':
          SwitchClass = StreamingModeSwitch
          break
        case 'ledPower':
          SwitchClass = LEDPowerSwitch
          break
      }

      return new SwitchClass({
        switchConfig,
        packageInfo,
        Service,
        Characteristic,
        logiService: this.logiService,
        log: this._log,
      })
    })

    callback(accessories)
  }
}
