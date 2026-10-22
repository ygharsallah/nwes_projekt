#include <Arduino.h>

#include "graphics/neopixel_renderer.h"
#include "animation/animation_player.h"
#include "network/network_manager.h"
#include "web/animation_web_server.h"

NeoPixelRenderer renderer;
AnimationPlayer animationPlayer(renderer);
NetworkManager networkManager;
AnimationWebServer webServer(animationPlayer);

void setup() {
    Serial.begin(115200);

    renderer.setup();

    if (!networkManager.setup()) {
        Serial.println("Wi-Fi setup failed");
        return;
    }
    
    webServer.setup();
}

void loop() {
    webServer.update();
    animationPlayer.update();
    delay(1);
}
