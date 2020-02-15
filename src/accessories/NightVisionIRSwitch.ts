import { BaseSwitch, SwitchConfig } from './BaseSwitch'
import LogiService = require('../LogiService')

export class NightVisionIRSwitch extends BaseSwitch {
  constructor(switchConfig: SwitchConfig, logiService: LogiService) {
    super(
      switchConfig,
      'nightVisionIrLedsEnabled',
      logiService,
      'nightVisionIR',
    )
  }
}
