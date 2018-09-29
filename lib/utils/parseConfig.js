const { array, boolean, object, string } = require('yup')

const configSchema = object({
  email: string().required(),
  password: string().required(),
  accessories: array()
    .of(
      object({
        deviceId: string().required(),
        name: string().default('Logi Circle'),
        privacyMode: object({
          name: string().default('Privacy Mode'),
          disabled: boolean(),
        }),
        streamingMode: object({
          name: string().default('Steaming Mode'),
          disabled: boolean(),
        }),
        ledPower: object({
          name: string().default('LED Power'),
          disabled: boolean(),
        }),
      }),
    )
    .required(),
})

/**
 * Parses accessory configuration, returning a Promise that resolves to
 * a normalized copy. Rejects with validation error(s) if config is invalid
 * @param {Object} config configuration object from Homebridge
 */
module.exports = async function(config, log) {
  return configSchema.validate(config)
}
