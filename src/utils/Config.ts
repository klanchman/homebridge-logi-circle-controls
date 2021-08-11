import { array, boolean, InferType, object, string } from 'yup'

const configSchema = object({
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
      lightSensor: object({
        name: string().default('Light Sensor'),
        disabled: boolean(),
      }),
      nightVisionIR: object({
        name: string().default('Night IR'),
        disabled: boolean().default(true),
      }),
      nightVisionMode: object({
        name: string().default('Night Vision'),
        disabled: boolean().default(true),
      }),
      recording: object({
        name: string().default('Recording'),
        disabled: boolean(),
      }),
    }),
  ).required(),
})

/**
 * Parses accessory configuration, returning a Promise that resolves to
 * a normalized copy. Rejects with validation error(s) if config is invalid
 * @param config configuration object from Homebridge
 */
export const parseConfig = async (config: unknown) => {
  return configSchema.validate(config)
}

export type Config = InferType<typeof configSchema>
export type AccessoryConfig = Config['accessories'][number]
