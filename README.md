# NeoPixel Animator — ESP32 access point + class-based backend

The files in `data/` are the exact HTML, CSS and JavaScript supplied for this version of the project. No frontend code needs editing.

## Project architecture

| File | Responsibility |
| --- | --- |
| `include/config/app_config.h` | Wi-Fi hotspot credentials, output GPIO, brightness and limits |
| `network/NetworkManager` | Creates an ESP32 Wi-Fi access point |
| `web/AnimationWebServer` | Serves `index.html`, `style.css`, `script.js`; receives `POST /api/animation` |
| `animation/AnimationParser` | Converts JSON into compact frame data and bounds array sizes |
| `animation/AnimationPlayer` | Stores the last uploaded animation and advances it using `millis()` |
| `graphics/NeoPixelRenderer` | Draws frame colors to WS2812/NeoPixel through the Adafruit library |
| `src/main.cpp` | Calls `setup()` once and `update()` repeatedly |

## Quick start

1. Open this directory in PlatformIO.
2. Edit `include/config/app_config.h`: Wi-Fi password, LED GPIO, and brightness. Default **GPIO16** and Wi-Fi name **SmartMatrix**; change password **ChangeThis123**.
3. Upload firmware and website together: `pio run -t upload` (or click PlatformIO's **Upload** action). The files in `data/` are embedded automatically in the firmware; no separate `uploadfs` step is needed.
4. Join the Wi-Fi network `SmartMatrix` on a phone or laptop, then navigate to **http://192.168.4.1/**. A phone may say the Wi-Fi network has no internet; stay connected.
5. Edit LEDs/frames, click **Upload**. The strip immediately shows frame 1 and loops the uploaded animation.

No home router or internet connection is required. The ESP32 hosts its own network and website.

## Routes matching your unchanged frontend

| Method | URL | Result |
| --- | --- | --- |
| `GET` | `/` | Sends the exact `index.html` |
| `GET` | `/style.css` | Sends the exact CSS |
| `GET` | `/script.js` | Sends the exact JavaScript |
| `POST` | `/api/animation` | Parses JSON and starts playback; returns `200` JSON on success, `400`/`413` on invalid input |
| `GET` | `/api/status` | Returns a JSON status object (optional for future development) |

Accepted payload (the exact format sent by the existing JavaScript):

```json
{
  "ledCount": 2,
  "frameTime": 500,
  "frames": [
    {"leds": [{"color": "#ff0000", "enabled": true}, {"color": "#00ff00", "enabled": false}]},
    {"leds": [{"color": "#0000ff", "enabled": true}, {"color": "#ffffff", "enabled": true}]}
  ]
}
```

The backend keeps only JSON decoding, a 60,000-byte request limit, and array bounds (1–64 LEDs and 1–16 frames). It trusts the editor's field values instead of separately validating every type, color and frame duration. Missing LED values become off/black; missing frame time defaults to 500 ms. The editor advertises 20–60000 ms per frame, though the backend no longer enforces that range. Adding a 17th frame is possible in the editor, but uploading it returns HTTP 400. The frontend reports failures in the browser developer console.

Uploaded animation data is stored in RAM; it **does not survive a restart**. The website is stored in firmware flash and remains available after a restart.

## Physical wiring

For a **5 V NeoPixel / WS2812 LED strip**:

- External regulated 5 V power → strip +5 V; external GND → strip GND and ESP32 GND (shared reference).
- For the 30-pin ESP32, its dedicated 5 V/VIN input can use the regulated 5 V if your exact board's labeling confirms it. Never connect 5 V to ESP32 GPIO or 3V3.
- GPIO16 (3.3 V output) → SN74HCT245N pin **2 (A1)**. Converter pin **18 (B1)** → **330–470 Ω** series resistor → NeoPixel **DIN**. Use only the strip's data **input**, not data output.
- SN74HCT245N pin **20 (VCC)** → 5 V; pin **10 (GND)** → GND; pin **1 (DIR)** → 5 V; pin **19 (/OE)** → GND. Place **100 nF** between pin 20 and pin 10 near the chip. Tie unused *A* inputs to GND, leave unused *B* outputs unconnected.
- A bulk capacitor (typically 500–1000 µF, rated at least 6.3 V) across the strip supply is recommended; observe polarity. Avoid powering the LED strip through an ESP32 pin or breadboard traces. Disconnect external VIN power before connecting USB unless your board has suitable backfeed protection.

`NEO_GRB + NEO_KHZ800` is the common WS2812B setting. For other NeoPixel types, adjust it in `neopixel_renderer.cpp`.

## Build notes

The project uses PlatformIO's `esp32dev` board and Arduino framework, with **Adafruit NeoPixel** and **ArduinoJson 7**. PlatformIO embeds the three frontend files using `board_build.embed_txtfiles`, and the web server serves them directly from firmware flash. After editing files in `data/`, upload the firmware again to publish the updated website. No filesystem upload, external web server or database is needed.
