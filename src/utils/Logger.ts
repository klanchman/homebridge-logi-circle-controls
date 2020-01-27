export class Logger {
  private static instance: Logger

  private constructor(private logger: Homebridge.Logger) {}

  static configure(logger: Homebridge.Logger) {
    Logger.instance = new Logger(logger)
  }

  static get shared(): Homebridge.Logger {
    if (!Logger.instance) {
      throw new Error(
        'You must call Logger.configure before using the singleton',
      )
    }

    return Logger.instance.logger
  }
}
