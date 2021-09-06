import { InferType, object, string } from 'yup'

const configSchema = object({
  nameOverrides: object({
    camera: string().default('Camera'),
    led: string().default('LED'),
    nightVisionIR: string().default('Night IR'),
    nightVisionMode: string().default('Night Vision'),
    recording: string().default('Recording'),
  }),
})

/**
 * Parses accessory configuration, returning a normalized copy. Throws a
 * validation error if config is invalid
 * @param config configuration object from Homebridge
 */
export const parseConfig = (config: unknown) => {
  return configSchema.validateSync(config)
}

export type Config = InferType<typeof configSchema>
