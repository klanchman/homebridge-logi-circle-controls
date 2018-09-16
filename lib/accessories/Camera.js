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

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(Characteristic.Model, packageInfo.platformName)
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, packageInfo.version)

    this.name = config.name

    // FIXME: Generate switches from config

    this.privacySwitch = new PrivacyModeSwitch({
      switchConfig: {
        name: 'Privacy Mode',
        deviceId: config.deviceId,
      },
      Service,
      Characteristic,
      logiService: this.logiService,
      log: this._log,
    })

    this.ledPowerSwitch = new LEDPowerSwitch({
      switchConfig: {
        name: 'LED Power',
        deviceId: config.deviceId,
      },
      Service,
      Characteristic,
      logiService: this.logiService,
      log: this._log,
    })

    this.streamingModeSwitch = new StreamingModeSwitch({
      switchConfig: {
        name: 'Streaming Mode',
        deviceId: config.deviceId,
      },
      Service,
      Characteristic,
      logiService: this.logiService,
      log: this._log,
    })
  }

  getServices() {
    return [
      this.informationService,
      this.privacySwitch.switchService,
      this.ledPowerSwitch.switchService,
      this.streamingModeSwitch.switchService,
    ]
  }
}

module.exports = Camera
