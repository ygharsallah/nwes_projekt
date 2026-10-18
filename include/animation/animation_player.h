#pragma once

#include <Arduino.h>
#include "animation/animation.h"
#include "graphics/neopixel_renderer.h"

class AnimationPlayer {
public:
    explicit AnimationPlayer(NeoPixelRenderer& renderer);

    void update();
    void play(const Animation& animation);

    const Animation& getAnimation() const { return animation_; }
    size_t getActiveFrame() const { return activeFrame_; }

private:
    NeoPixelRenderer& renderer_;
    Animation animation_;
    size_t activeFrame_ = 0;
    uint32_t lastFrameMs_ = 0;
};
