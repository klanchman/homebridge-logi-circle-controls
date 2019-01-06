const LEDPowerSwitch = require('./LEDPowerSwitch')
const PrivacyModeSwitch = require('./PrivacyModeSwitch')
const RecordingSwitch = require('./RecordingSwitch')
const StreamingModeSwitch = require('./StreamingModeSwitch')

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

    if (!config.camera.disabled) {
      this.switches.push(
        new StreamingModeSwitch({
          switchConfig: {
            name: config.camera.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: this._log,
        }),
      )
    }

    if (!config.led.disabled) {
      this.switches.push(
        new LEDPowerSwitch({
          switchConfig: {
            name: config.led.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: this._log,
        }),
      )
    }

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

    if (!config.recording.disabled) {
      this.switches.push(
        new RecordingSwitch({
          switchConfig: {
            name: config.recording.name,
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
