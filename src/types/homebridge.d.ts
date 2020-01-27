declare namespace Homebridge {
  interface API {
    hap: {
      Characteristic: typeof import('hap-nodejs').Characteristic
      Service: typeof import('hap-nodejs').Service
      uuid: typeof import('hap-nodejs').uuid
    }

    registerPlatform(
      pluginName: string,
      platformName: string,
      constructor: PlatformConstructor,
      dynamic?: boolean,
    ): void
  }

  interface Logger {
    (...args: any[]): void

    debug(...args: any[]): void
    info(...args: any[]): void
    warn(...args: any[]): void
    error(...args: any[]): void

    log(level: string, ...args: any[]): void
  }

  type PlatformConstructor = new (
    logger: Logger,
    config: any,
    api: API,
  ) => Platform

  interface Platform {
    accessories(callback: (accessories: Accessory[]) => void): void
  }

  interface Accessory {
    getServices(): import('hap-nodejs').Service[]
  }
}
