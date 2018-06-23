const axios = require('axios').default

const accessoryName = 'Logi Circle Privacy Mode Switch'
const logiBaseUrl = 'https://video.logi.com/api/'
const logiAuthHeader = 'x-logi-auth'

let Accessory, Service, Characteristic, UUIDGen

module.exports = function(homebridge) {
  Accessory = homebridge.platformAccessory

  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerAccessory(
    'homebridge-logi-circle-2-privacy',
    accessoryName,
    LogiCirclePrivacyModeSwitch,
    true,
  )
}

class LogiCirclePrivacyModeSwitch {
  constructor(log, config, api) {
    this.log = log

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
      .setCharacteristic(Characteristic.FirmwareRevision, '0.1.0')

    this.axios = axios.create({
      baseURL: logiBaseUrl,
    })

    this.axios.interceptors.response.use(
      undefined,
      this.unauthorizedRequestInterceptor,
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
      if (!this.isAuthenticated) await this.authenticate()

      const response = await this.axios.get(
        `accessories/${this.config.deviceId}`,
      )

      const state = response.data.configuration.privacyMode
      callback(undefined, state)
    } catch (error) {
      this.logAxiosError(error)
      callback(error)
    }
  }

  /**
   * Sets the switch state
   * @param {Boolean} nextState The desired switch state
   * @param {function} callback Node callback, takes Error?
   */
  async setState(nextState, callback) {
    try {
      if (!this.isAuthenticated) await this.authenticate()

      await this.axios.put(`accessories/${this.config.deviceId}`, {
        privacyMode: nextState,
      })

      callback()
    } catch (error) {
      callback(error)
    }
  }

  /**
   * Authenticates with Logitech's API and updates Axios headers with the
   * returned auth token
   * @throws
   * @returns Promise that resolves to the received auth token
   */
  async authenticate() {
    const response = await this.axios.post('accounts/authorization', {
      email: this.config.email,
      password: this.config.password,
    })

    const authToken = response.headers[logiAuthHeader]

    if (!authToken) {
      this.authenticated = false
      throw new Error('Authenticated but did not receive an auth token')
    }

    this.isAuthenticated = true

    this.axios.defaults.headers = {
      [logiAuthHeader]: authToken,
    }

    return authToken
  }

  /**
   * Error interceptor for Axios
   *
   * If response has 401 status, the interceptor will re-authenticate and try
   * the request again. If the request fails again, it will not be retried.
   *
   * If a request fails for a reason other than a 401 response, the interceptor
   * does not do anything with it.
   * @param {any} error error intercepted from Axios
   */
  async unauthorizedRequestInterceptor(error) {
    if (!error.config || !error.response || error.response.statusCode !== 401) {
      if (error.config.__isAuthRetry) {
        this.log('Request failed again after re-authentication')
      }
      return Promise.reject(error)
    }

    this.log('Received a 401, re-authenticating and trying again')
    const authToken = await this.authenticate()
    const newConfig = {
      ...error.config,
      __isAuthRetry: true,
      headers: {
        ...error.config.headers,
        [logiAuthHeader]: authToken,
      },
    }
    return this.axios.request(newConfig)
  }

  /**
   * Validates accessory configuration, throws an error if config is invalid
   * @param {any} config configuration object from Homebridge
   * @throws
   */
  validateConfig(config) {
    if (!config.name) {
      throw new Error(`${accessoryName} config must define property "name"`)
    }

    if (!config.email) {
      throw new Error(`${accessoryName} config must define property "email"`)
    }

    if (!config.password) {
      throw new Error(`${accessoryName} config must define property "password"`)
    }

    if (!config.deviceId) {
      throw new Error(`${accessoryName} config must define property "deviceId"`)
    }
  }

  /**
   * Logs an error thrown by Axios
   * @param {any} error error from Axios
   */
  logAxiosError(error) {
    this.log('Error processing request')
    if (error.response) {
      this.log(`Server returned status ${error.response.status}`)
    } else if (error.request) {
      this.log('No response received')
    } else {
      this.log('Unknown error')
    }
  }
}
