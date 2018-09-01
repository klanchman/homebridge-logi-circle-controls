const cloneDeep = require('lodash.clonedeep')

const supportedAccesoryTypes = ['privacyMode', 'streamingMode', 'ledPower']
const requiredTopFields = ['email', 'password', 'accessories']
const requiredAccessoryFields = ['name']

/**
 * Parses accessory configuration, returning a normalized copy. Throws an error if config is invalid
 * @param {Object} config configuration object from Homebridge
 * @throws
 */
module.exports = function(config, log) {
  const parsedConfig = cloneDeep(config)

  if (config.deviceId) {
    log.warn(
      'DEPRECATION: Field "deviceId" is deprecated and will be removed in a future version. Use "defaultDeviceId" instead.',
    )
  }

  // Top level
  requiredTopFields.forEach(f => {
    if (!parsedConfig[f]) throw new Error(`config must define property "${f}"`)
  })

  if (!Array.isArray(parsedConfig.accessories))
    throw new Error('config property "accessories" must be an array')

  // Accessories
  parsedConfig.accessories.forEach(accessory => {
    requiredAccessoryFields.forEach(f => {
      if (!accessory[f])
        throw new Error(`accessory config must define property "${f}"`)
    })

    if (!supportedAccesoryTypes.includes(accessory.type)) {
      throw new Error(
        `"type" for accessory "${accessory.name}" is not supported`,
      )
    }

    // Find the deviceId to use, most specific to most general
    accessory.deviceId =
      accessory.deviceId ||
      parsedConfig.defaultDeviceId ||
      parsedConfig.deviceId // DEPRECATED - remove in the future

    if (!accessory.deviceId)
      throw new Error(
        'config must define property "defaultDeviceId", or accessory config must define "deviceId"',
      )
  })

  return parsedConfig
}
