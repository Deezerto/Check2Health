package com.appdev.lastico.check2health.Utility;

import org.springframework.stereotype.Component;

@Component
public class SanitizationUtil {

    public String sanitize(String input) {
        if (input == null) {
            return null;
        }
        // Remove all HTML tags
        return input.replaceAll("<[^>]*>", "");
    }
}
