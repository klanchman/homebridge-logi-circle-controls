// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { version } = require('../../package.json')

export const PackageInfo = {
  identifier: 'homebridge-logi-circle-controls',
  platformName: 'Logi Circle Controls',
  version: version as string,
}
