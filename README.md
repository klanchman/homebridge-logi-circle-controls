# Homebridge Logitech Circle Controls

This is a Homebridge plugin that exposes extended controls for Logitech Circle cameras, such as toggles for privacy mode, camera on/off, and LED on/off.

## Install

```
npm i -g homebridge-logi-circle-controls
```

### Minimum Requirements

- Node v12+
- Homebridge v1.3+

## Log In

Run the included command line tool to log into your Logitech account:

```
homebridge-logi-circle-controls login
```

If your Homebridge configuration path is non-standard, use the `-d` option to specify where it is.

Use the `-h` option to get additional help.

## Configure

In your Homebridge config.json file, add a new entry in `platforms` that looks like this:

```jsonc
{
  "platform": "Logi Circle Controls",

  /* Optional: overrides for names of accessories the platform provides */
  "nameOverrides": {
    "camera": "<Optional: the desired name of the camera switch | Default: 'Camera'>",
    "led": "<Optional: the desired name of the LED switch | Default: 'LED'>",
    "recording": "<Optional: the desired name of the recording switch | Default: 'Recording'>",
    "nightVisionMode": "<Optional: the desired name of the night vision mode switch | Default: 'Night Vision'>",
    "nightVisionIR": "<Optional: the desired name of the night vision IR switch | Default: 'Night IR'>"
  }
}
```
