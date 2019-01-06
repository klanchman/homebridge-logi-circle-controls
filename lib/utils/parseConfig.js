const { array, boolean, object, string } = require('yup')

const configSchema = ({ alias }) =>
  object({
    email: string().required(),
    password: string().required(),
    accessories: array(
      object({
        deviceId: string().required(),
        name: string().default('Logi Circle'),
        camera: object({
          name: string().default('Camera'),
          disabled: boolean(),
        }),
        led: object({
          name: string().default('LED'),
          disabled: boolean(),
        }),
        privacyMode: object({
          name: string().default('Privacy Mode'),
          disabled: boolean(),
        }),
        recording: object({
          name: string().default('Recording'),
          disabled: boolean().default(true),
        }),
      })
        .from('ledPower', 'led', alias)
        .from('streamingMode', 'camera', alias),
    ).required(),
  })

/**
 * Parses accessory configuration, returning a Promise that resolves to
 * a normalized copy. Rejects with validation error(s) if config is invalid
 * @param {Object} config configuration object from Homebridge
 */
module.exports = async function(config, log) {
  const transformed = await configSchema({ alias: true }).validate(config)

  if (transformed.accessories.some(a => !a.privacyMode.disabled)) {
    log.warn(
      '[DEPRECATED] `privacyMode` switch is deprecated and will be removed in a future version. Use `recording` switch instead by adding `disabled: false` for its configuration. Silence this warning by setting `disabled: true` for the `privacyMode` switch.',
    )
  }

  if (transformed.accessories.some(a => a.ledPower !== undefined)) {
    log.warn(
      '[DEPRECATED] `ledPower` switch is deprecated and will be removed in a future version. Use `led` switch instead. Silence this warning by renaming `ledPower` to `led`.',
    )
  }

  if (transformed.accessories.some(a => a.streamingMode !== undefined)) {
    log.warn(
      '[DEPRECATED] `streamingMode` switch is deprecated and will be removed in a future version. Use `camera` switch instead. Silence this warning by renaming `streamingMode` to `camera`.',
    )
  }

  return configSchema({ alias: false }).validate(config)
}
