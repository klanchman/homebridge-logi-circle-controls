// @ts-check

const LogiService = require('./LogiService')

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

    this.validateConfig(config)
    this.config = config

    this.switchService = new Service.Switch(this.config.name)

    this.switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getState.bind(this))
      .on('set', this.setState.bind(this))

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(
        Characteristic.Model,
        'Logi Circle Privacy Mode Switch',
      )
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, packageInfo.version)

    this.logiService = new LogiService(
      {
        email: this.config.email,
        password: this.config.password,
      },
      this._log,
    )
  }

  getServices() {
    return [this.informationService, this.switchService]
  }

  /**
   * Gets the state of the swtich
   * @param {function} callback Node callback, takes Error? and Boolean?
   */
  async getState(callback) {
    try {
      const response = await this.logiService.request(
        'get',
        `accessories/${this.config.deviceId}`,
      )

      const state = response.data.configuration.privacyMode
      callback(undefined, state)
    } catch (error) {
      callback(error)
    }
  }

  /**
   * Sets the switch state
   * @param {boolean} nextState The desired switch state
   * @param {function} callback Node callback, takes Error?
   */
  async setState(nextState, callback) {
    try {
      await this.logiService.request(
        'put',
        `accessories/${this.config.deviceId}`,
        {
          privacyMode: nextState,
        },
      )

      callback()
    } catch (error) {
      callback(error)
    }
  }

  /**
   * Validates accessory configuration, throws an error if config is invalid
   * @param {Object} config configuration object from Homebridge
   * @throws
   */
  validateConfig(config) {
    if (!config.name) {
      throw new Error(
        `${packageInfo.accessoryName} config must define property "name"`,
      )
    }

    if (!config.email) {
      throw new Error(
        `${packageInfo.accessoryName} config must define property "email"`,
      )
    }

    if (!config.password) {
      throw new Error(
        `${packageInfo.accessoryName} config must define property "password"`,
      )
    }

    if (!config.deviceId) {
      throw new Error(
        `${packageInfo.accessoryName} config must define property "deviceId"`,
      )
    }
  }
}
