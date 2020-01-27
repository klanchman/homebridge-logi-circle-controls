export class HomebridgeAPI {
  private static instance: HomebridgeAPI

  private constructor(private api: Homebridge.API) {}

  static configure(api: Homebridge.API) {
    HomebridgeAPI.instance = new HomebridgeAPI(api)
  }

  static get shared(): HomebridgeAPI {
    if (!HomebridgeAPI.instance) {
      throw new Error(
        'You must call HomebridgeAPI.configure before using the singleton',
      )
    }

    return HomebridgeAPI.instance
  }

  get Characteristic(): Homebridge.API['hap']['Characteristic'] {
    return this.api.hap.Characteristic
  }

  get Service(): Homebridge.API['hap']['Service'] {
    return this.api.hap.Service
  }
}
