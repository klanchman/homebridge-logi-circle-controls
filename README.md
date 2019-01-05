# Homebridge Logitech Circle Controls

This is a Homebridge plugin that exposes extended controls for Logitech Circle cameras, such as toggles for privacy mode, camera on/off, and LED on/off.

## Installation

Tested with Node v8.9 and Homebridge v0.4.42.

```
npm i -g homebridge-logi-circle-controls
```

## Finding Your Device's ID

You'll need to know the ID of your device(s) to configure this plugin.

Log into the web interface at https://circle.logi.com.

Once logged in and viewing a camera, the URL should be along the lines of `https://circle.logi.com/#/accessories/<ID>`. The ID in the URL is the device ID required in the config objects below.

## Configuration

In your Homebridge config.json file, add a new entry in `platforms` that looks like this:

```jsonc
{
  "platform": "Logi Circle Controls",
  "name": "<Optional: the desired name for the platform (mostly affects Homebridge logs) | Default: 'Logi Circle Controls'>",
  "email": "<Required: the email for your Logitech Circle account>",
  "password": "<Required: the password for your Logitech Circle account>",
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
  "privacyMode": {
    "name": "<Optional: the desired name of the privacy mode switch | Default: 'Privacy Mode'>",
    "disabled": false /* Optional: set to true to disable this switch | Default: false */
  },
  "streamingMode": {
    "name": "<Optional: the desired name of the streaming mode switch | Default: 'Streaming Mode'>"
    "disabled": false /* Optional: set to true to disable this switch | Default: false */
  },
  "ledPower": {
    "name": "<Optional: the desired name of the LED power switch | Default: 'LED Power'>"
    "disabled": false /* Optional: set to true to disable this switch | Default: false */
  }
}
```

#### `privacyMode` Switch

Controls recording. When the switch is on, recording is disabled. When the switch is off, recording is enabled.

#### `streamingMode` Switch

Controls the camera's on/off state. When the switch is on, the camera is on. When the switch is off, the camera is off.

Please note that it seems Logitech does not _actually_ prevent the camera from being viewed when this switch is off, at least via HomeKit. Refer to [issue #8](https://github.com/klanchman/homebridge-logi-circle-controls/issues/8).

#### `ledPower` Switch

Controls the LED ring power. When the switch is off, the LED ring is off. When the switch is on, the LED ring is on.
