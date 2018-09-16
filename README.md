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

Once logged in and viewing a camera, the URL should be along the lines of `https://circle.logi.com/#/accessories/<ID>`. The ID in the URL is the device ID required in the config objects above.

## Configuration

In your Homebridge config.json file, add a new entry in `platforms` that looks like this:

```jsonc
{
  "platform": "Logi Circle Controls",
  "name": "<the desired name for the platform (mostly affects Homebridge logs)>",
  "email": "<the email for your Logitech Circle account>",
  "password": "<the password for your Logitech Circle account>",
  "accessories": [] /* See "Accessories" subsection */
}
```

### Accessories

In the above configuration, `accessories` is an array of cameras for this platform to control.

An accessory config object looks like this:

```jsonc
{
  "name": "<Optional: The desired name for the camera | Default: Logi Circle>",
  "deviceId": "<The ID of your camera>"
}
```

Each camera has a privacy mode, LED power, and streaming mode switch.
