package com.appsmith.server.migrations;

import java.util.Set;

public class ApplicationVersion {
    // EARLIEST_VERSION will never be changed
    public static final String EARLIEST_VERSION = "1.0.0";

    // increment the LATEST_VERSION when there is a breaking change and user need to upgrade manually
    public static final String LATEST_VERSION = "2.0.0";

    private static final Set<String> SUPPORTED_VERSIONS = Set.of(EARLIEST_VERSION, LATEST_VERSION);

    public static boolean isSupported(String applicationVersion) {
        return applicationVersion != null && SUPPORTED_VERSIONS.contains(applicationVersion);
    }
}
