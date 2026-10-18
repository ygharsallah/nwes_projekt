#pragma once

#include <Arduino.h>
#include "animation/animation.h"

class AnimationParser {
public:
    static bool parse(const String& json, Animation& result);
};
