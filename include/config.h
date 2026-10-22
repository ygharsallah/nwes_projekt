#pragma once

#include <stddef.h>
#include <stdint.h>

namespace Config {
    constexpr uint8_t LED_PIN = 26;
    constexpr uint8_t BRIGHTNESS = 120;

    constexpr size_t MAX_LEDS = 64;
    constexpr size_t MAX_FRAMES = 16;
    constexpr size_t MAX_JSON_BYTES = 60000;

    constexpr char AP_SSID[] = "ESP NeoPixelAnimator";
    constexpr char AP_PASSWORD[] = "Yones1234";
}
