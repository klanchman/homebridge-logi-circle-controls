import type { API, Logging } from 'homebridge'
import { BaseSwitch, SwitchConfig } from './BaseSwitch'
import LogiService = require('../LogiService')

export class LEDSwitch extends BaseSwitch {
  constructor(
    api: API,
    log: Logging,
    switchConfig: SwitchConfig,
    logiService: LogiService,
  ) {
    super(api, log, switchConfig, 'ledEnabled', logiService, 'led')
  }
}
