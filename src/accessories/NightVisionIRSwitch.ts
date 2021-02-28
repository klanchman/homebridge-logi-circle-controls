import type { API, Logging } from 'homebridge'
import { BaseSwitch, SwitchConfig } from './BaseSwitch'
import LogiService = require('../LogiService')

export class NightVisionIRSwitch extends BaseSwitch {
  constructor(
    api: API,
    log: Logging,
    switchConfig: SwitchConfig,
    logiService: LogiService,
  ) {
    super(
      api,
      log,
      switchConfig,
      'nightVisionIrLedsEnabled',
      logiService,
      'nightVisionIR',
    )
  }
}
