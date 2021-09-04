import { isBefore, subMinutes } from 'date-fns'
import { InferType, object, string, number } from 'yup'

export class JWT {
  header: Record<string, string>
  payload: InferType<typeof basePayload>
  signature: string

  constructor(public rawToken: string) {
    const blocks = rawToken.split('.')

    if (blocks.length != 3) {
      throw new Error(`Expected JWT to have 3 blocks, but got ${blocks.length}`)
    }

    const b64D = (s: string) => Buffer.from(s, 'base64').toString()

    this.header = object().validateSync(JSON.parse(b64D(blocks[0])))
    this.payload = basePayload.validateSync(JSON.parse(b64D(blocks[1])))
    this.signature = blocks[2]
  }

  get isValid(): boolean {
    // Consider token valid up to 5 minutes before expiration
    return isBefore(subMinutes(new Date(), 5), this.payload.exp * 1000)
  }
}

const basePayload = object({
  sub: string().required(),
  exp: number().required(),
})
