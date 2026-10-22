#include "web/animation_web_server.h"
#include "animation/animation_parser.h"
#include "config.h"

#include <ArduinoJson.h>

// PlatformIO embeds these null-terminated files in the firmware's flash data.
extern const char indexHtml[] asm("_binary_data_index_html_start");
extern const char styleCss[] asm("_binary_data_style_css_start");
extern const char scriptJs[] asm("_binary_data_script_js_start");

AnimationWebServer::AnimationWebServer(AnimationPlayer& player)
    : player_(player), server_(80) {}

void AnimationWebServer::setup() {
    server_.on("/", HTTP_GET, [this]() {
        server_.send_P(200, "text/html; charset=utf-8", indexHtml);
    });
    server_.on("/style.css", HTTP_GET, [this]() {
        server_.send_P(200, "text/css; charset=utf-8", styleCss);
    });
    server_.on("/script.js", HTTP_GET, [this]() {
        server_.send_P(200, "text/javascript; charset=utf-8", scriptJs);
    });

    server_.on("/api/animation", HTTP_POST, [this]() { handleAnimationUpload(); });
    server_.on("/api/status", HTTP_GET, [this]() { handleStatus(); });
    server_.onNotFound([this]() { sendError(404, "Not found"); });
    server_.begin();
}

void AnimationWebServer::update() {
    server_.handleClient();
}

void AnimationWebServer::sendError(int status, const char* message) {
    JsonDocument doc;
    doc["ok"] = false;
    doc["error"] = message;
    String json;
    serializeJson(doc, json);
    server_.send(status, "application/json", json);
}

void AnimationWebServer::handleAnimationUpload() {
    const String body = server_.arg("plain");
    if (body.length() > Config::MAX_JSON_BYTES) {
        sendError(413, "Animation JSON too large");
        return;
    }

    if (!AnimationParser::parse(body, pendingUpload_)) {
        sendError(400, "Invalid JSON or animation size (1..64 LEDs, 1..16 frames)");
        return;
    }

    player_.play(pendingUpload_);

    server_.send(200, "application/json", "{\"ok\":true,\"playing\":true}");
}

void AnimationWebServer::handleStatus() {
    const Animation& animation = player_.getAnimation();
    JsonDocument doc;
    doc["ok"] = true;
    doc["playing"] = animation.frameCount > 0;
    doc["ledCount"] = animation.ledCount;
    doc["frameCount"] = animation.frameCount;
    doc["frameTime"] = animation.frameTimeMs;
    doc["activeFrame"] = player_.getActiveFrame();

    String json;
    serializeJson(doc, json);
    server_.send(200, "application/json", json);
}
