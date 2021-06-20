import type { API } from 'homebridge'
import { LogiCircleControlsPlatform } from './LogiCircleControlsPlatform'
import { PackageInfo } from './utils/PackageInfo'

export default (api: API) => {
  api.registerPlatform(
    PackageInfo.identifier,
    PackageInfo.platformName,
    LogiCircleControlsPlatform,
  )
}
