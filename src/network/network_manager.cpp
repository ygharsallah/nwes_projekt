#include "network/network_manager.h"
#include "config.h"
#include <WiFi.h>

bool NetworkManager::setup() {
    WiFi.mode(WIFI_AP);
    return WiFi.softAP(Config::AP_SSID, Config::AP_PASSWORD);
}
