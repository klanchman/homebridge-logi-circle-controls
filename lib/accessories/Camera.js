const PrivacyModeSwitch = require('./PrivacyModeSwitch')
const StreamingModeSwitch = require('./StreamingModeSwitch')
const LEDPowerSwitch = require('./LEDPowerSwitch')

class Camera {
  constructor({
    config,
    logiService,
    log,
    packageInfo,
    Service,
    Characteristic,
  }) {
    this.logiService = logiService
    this._log = log
    this.switches = []

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(Characteristic.Model, packageInfo.platformName)
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, packageInfo.version)

    this.name = config.name

    if (!config.privacyMode.disabled) {
      this.switches.push(
        new PrivacyModeSwitch({
          switchConfig: {
            name: config.privacyMode.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: this._log,
        }),
      )
    }

    if (!config.streamingMode.disabled) {
      this.switches.push(
        new StreamingModeSwitch({
          switchConfig: {
            name: config.streamingMode.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: this._log,
        }),
      )
    }

    if (!config.ledPower.disabled) {
      this.switches.push(
        new LEDPowerSwitch({
          switchConfig: {
            name: config.ledPower.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: this._log,
        }),
      )
    }
  }

  getServices() {
    return [this.informationService, ...this.switches.map(s => s.switchService)]
  }
}

module.exports = Camera
