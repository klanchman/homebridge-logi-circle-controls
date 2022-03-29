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

Use the `-h` option to get additional help.

Refer to the ["How to Log In" wiki page](https://github.com/klanchman/homebridge-logi-circle-controls/wiki/How-to-Log-In) for more detailed information about how to complete the process.

### Homebridge Configuration Path

The tool expects that your Homebridge `config.json` is located in `~/.homebridge`.

If this is not the case (e.g. Synology, Docker, etc.), use the `-d` option to specify the directory where your `config.json` is located:

```
homebridge-logi-circle-controls login -d /path/to/homebridge/config/dir
```

## Configure

In your Homebridge `config.json` file, add a new entry in `platforms` that looks like this:

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
