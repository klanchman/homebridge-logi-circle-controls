import type { API, Logging } from 'homebridge'
import { LogiService } from '../LogiService'
import { BaseSwitch, SwitchConfig } from './BaseSwitch'

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
