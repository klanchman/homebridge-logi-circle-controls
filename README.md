# Homebridge Logitech Circle Controls

This is a Homebridge plugin that exposes extended controls for Logitech Circle cameras, such as toggles for privacy mode, camera on/off, and LED on/off.

## Install

```sh-session
$ npm i -g homebridge-logi-circle-controls
```

### Minimum Requirements

- Node v12+
- Homebridge v1.3+

## Log In

Run the included command line tool to log into your Logitech account:

```sh-session
$ homebridge-logi-circle-controls login
```

If your Homebridge configuration path is non-standard, use the `-d` option to specify where it is.

Use the `-h` option to get additional help.

## Find Your Device's ID

You'll need to know the ID of your device(s) to configure this plugin.

Log into the web interface at https://circle.logi.com.

Once logged in and viewing a camera, the URL should be along the lines of `https://circle.logi.com/#/accessories/<ID>`. The ID in the URL is the device ID required in the config objects below.

## Configure

In your Homebridge config.json file, add a new entry in `platforms` that looks like this:

```jsonc
{
  "platform": "Logi Circle Controls",
  "name": "<Optional: the desired name for the platform (mostly affects Homebridge logs) | Default: 'Logi Circle Controls'>",
  "accessories": [] /* Required, see "Accessories" section */
}
```

### Accessories

In the above configuration, `accessories` is an array of cameras for this platform to control.

An accessory config object looks like this:

```jsonc
{
  "deviceId": "<Required: The ID of your camera>",
  "name": "<Optional: The desired name for the camera | Default: Logi Circle>",

  /* Each of the below objects is optional */

  "camera": {
    "name": "<Optional: the desired name of the camera switch | Default: 'Camera'>",
    "disabled": false /* Optional: set to true to disable this switch | Default: false */
  },
  "led": {
    "name": "<Optional: the desired name of the LED switch | Default: 'LED'>",
    "disabled": false /* Optional: set to true to disable this switch | Default: false */
  },
  "recording": {
    "name": "<Optional: the desired name of the recording switch | Default: 'Recording'>",
    "disabled": true /* Optional: set to true to disable this switch | Default: true */
  },
  "nightVisionMode": {
    "name": "<Optional: the desired name of the night vision mode switch | Default: 'Night Vision'>",
    "disabled": true /* Optional: set to true to disable this switch | Default: true */
  },
  "nightVisionIR": {
    "name": "<Optional: the desired name of the night vision IR switch | Default: 'Night IR'>",
    "disabled": true /* Optional: set to true to disable this switch | Default: true */
  }
}
```

#### `camera` Switch

Controls the camera's on/off state. When the switch is on, the camera is on. When the switch is off, the camera is off.

#### `led` Switch

Controls the LED ring power. When the switch is off, the LED ring is off. When the switch is on, the LED ring is on.

#### `recording` Switch

Controls recording. When the switch is on, recording is enabled. When the switch is off, recording is disabled.

#### `nightVisionMode` Switch

Controls night vision mode. When the switch is on, the camera will automatically switch into night vision mode when it's dark.
When the switch is off, night vision is disabled.

#### `nightVisionIR` Switch

Controls night vision IR LEDs. When the switch is on, the camera will use the IR LEDs when in night vision mode.
When the switch is off, night vision IR LEDs are disabled.
