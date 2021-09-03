import { InferType, object, ObjectSchema } from 'yup'

export class JWT<Payload extends Record<string, unknown>> {
  private constructor(
    public header: Record<string, string>,
    public payload: Payload,
    public signature: string,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromString<PayloadShape extends ObjectSchema<Record<string, any>>>(
    tokenString: string,
    payloadShape: PayloadShape,
  ): JWT<InferType<PayloadShape>> {
    const blocks = tokenString.split('.')

    if (blocks.length != 3) {
      throw new Error(`Expected JWT to have 3 blocks, but got ${blocks.length}`)
    }

    const b64D = (s: string) => Buffer.from(s, 'base64').toString()

    const header = object().validateSync(JSON.parse(b64D(blocks[0])))
    const payload = payloadShape.validateSync(JSON.parse(b64D(blocks[1])))

    return new JWT(header, payload, blocks[2])
  }
}
