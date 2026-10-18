#include "animation/animation_player.h"

AnimationPlayer::AnimationPlayer(NeoPixelRenderer& renderer)
    : renderer_(renderer) {}

void AnimationPlayer::play(const Animation& animation) {
    animation_ = animation;
    activeFrame_ = 0;
    lastFrameMs_ = millis();
    renderer_.showFrame(animation_.frames[activeFrame_], animation_.ledCount);
}

void AnimationPlayer::update() {
    if (animation_.frameCount < 2) return;

    const uint32_t now = millis();
    if (now - lastFrameMs_ < animation_.frameTimeMs) return;

    lastFrameMs_ = now;
    activeFrame_ = (activeFrame_ + 1) % animation_.frameCount;
    renderer_.showFrame(animation_.frames[activeFrame_], animation_.ledCount);
}

