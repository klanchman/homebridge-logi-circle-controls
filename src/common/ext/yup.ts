import { ObjectSchema } from 'yup'

export const mapRuleToKeys = <
  O extends Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends ObjectSchema<Record<string, any>>,
>(
  obj: O,
  rule: R,
) =>
  Object.keys(obj).reduce<{ [K: string]: R }>(
    (result, key) => ({
      ...result,
      [key]: rule,
    }),
    {},
  )
