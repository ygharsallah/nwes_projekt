#include "graphics/neopixel_renderer.h"
#include "config.h"

NeoPixelRenderer::NeoPixelRenderer()
    : strip_(Config::MAX_LEDS, Config::LED_PIN, NEO_GRB + NEO_KHZ800) {}

void NeoPixelRenderer::setup() {
    strip_.begin();
    strip_.setBrightness(Config::BRIGHTNESS);
    strip_.clear();
    strip_.show();
}

void NeoPixelRenderer::showFrame(const AnimationFrame& frame, uint16_t ledCount) {
    strip_.clear();
    for (uint16_t i = 0; i < ledCount; ++i) {
        strip_.setPixelColor(i, frame.colors[i]);
    }
    strip_.show();
}
