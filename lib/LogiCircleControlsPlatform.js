// @ts-check

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

    // FIXME: Constructor run twice, 2nd time with no config?
    validateConfig(config)
    this.config = config

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(Characteristic.Model, packageInfo.platformName)
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, packageInfo.version)

    // FIXME: Constructor run twice, 2nd time with no config?
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

      return new SwitchClass(
        switchConfig,
        this.logiService,
        this._log,
        Service,
        Characteristic,
      )
    })

    callback(accessories)
  }

  getServices() {
    // FIXME: Think this needs to be moved into the switches? (Or need to put switch info here?)
    return [this.informationService]
  }
}
