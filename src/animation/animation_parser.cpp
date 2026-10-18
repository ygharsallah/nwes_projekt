#include "animation/animation_parser.h"

#include <ArduinoJson.h>
#include <stdlib.h>

bool AnimationParser::parse(const String& json, Animation& result) {
    JsonDocument doc;
    if (deserializeJson(doc, json)) return false;

    const int count = doc["ledCount"].as<int>();
    JsonArrayConst jsonFrames = doc["frames"].as<JsonArrayConst>();
    
    if (count < 1 || count > static_cast<int>(Config::MAX_LEDS) ||
        jsonFrames.size() == 0 || jsonFrames.size() > Config::MAX_FRAMES) {
        return false;
    }

    result.ledCount = static_cast<uint16_t>(count);
    result.frameCount = jsonFrames.size();
    result.frameTimeMs = doc["frameTime"] | 500U;
    for (size_t frame = 0; frame < result.frameCount; ++frame) {
        for (uint16_t i = 0; i < result.ledCount; ++i) {
            JsonVariantConst led = jsonFrames[frame]["leds"][i];
            const char* color = led["color"] | "#000000";
            result.frames[frame].colors[i] = led["enabled"].as<bool>()
                ? strtoul(color + (color[0] == '#'), nullptr, 16) & 0xFFFFFF
                : 0;
        }
    }
    return true;
}
