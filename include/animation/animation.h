#pragma once

#include <stdint.h>
#include <stddef.h>
#include "app_config.h"

struct AnimationFrame {
    uint32_t colors[Config::MAX_LEDS] = {};
};

struct Animation {
    AnimationFrame frames[Config::MAX_FRAMES] = {};
    uint16_t ledCount = 30;
    size_t frameCount = 0;
    uint32_t frameTimeMs = 500;
};
