package com.appsmith.server.domains;

public enum ApplicationLifecycleState {
    DRAFT,
    PUBLISHED,
    UNPUBLISHED,
    ARCHIVED;

    public static ApplicationLifecycleState fromNullable(ApplicationLifecycleState value) {
        return value == null ? DRAFT : value;
    }
}
