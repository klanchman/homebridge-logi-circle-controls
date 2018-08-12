const supportedAccesoryTypes = ['privacyMode', 'streamingMode', 'ledPower']

/**
 * Validates accessory configuration, throws an error if config is invalid
 * @param {Object} config configuration object from Homebridge
 * @throws
 */
module.exports = function(config) {
  // Top level

  if (!config.email) {
    throw new Error('config must define property "email"')
  }

  if (!config.password) {
    throw new Error('config must define property "password"')
  }

  if (!config.deviceId) {
    throw new Error('config must define property "deviceId"')
  }

  if (!config.accessories) {
    throw new Error('config must define property "accessories"')
  }

  if (!Array.isArray(config.accessories)) {
    throw new Error('config property "accessories" must be an array')
  }

  // Accessories

  config.accessories.map(accessory => {
    if (!accessory.name) {
      throw new Error('accessory config must define property "name"')
    }

    if (!supportedAccesoryTypes.includes(accessory.type)) {
      throw new Error(
        `"type" for accessory "${accessory.name}" is not supported`,
      )
    }
  })
}
