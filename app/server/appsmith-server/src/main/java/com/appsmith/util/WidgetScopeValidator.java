package com.appsmith.util;

import java.util.Set;

/**
 * Validates the widget-scoped params that the AS09 TableWidget binding
 * pipeline passes through POST /api/v1/actions/:id/execute.
 *
 * Supported scopes today: "table". The intent is to add additional
 * scopes (list, chart, ...) in follow-up PRs as more widget types gain
 * data-source binding.
 *
 * Unknown scope values surface as HTTP 400 with error code
 * "invalid_widget_scope" at the controller layer.
 */
public final class WidgetScopeValidator {

    private static final Set<String> SUPPORTED_SCOPES = Set.of("table");
    public static final String INVALID_SCOPE_ERROR_CODE = "invalid_widget_scope";

    private WidgetScopeValidator() {}

    public static boolean isValidScope(String scope) {
        if (scope == null || scope.isBlank()) {
            // null/blank is treated as "no widget scope" which is valid
            // for callers that don't bind through a widget at all.
            return true;
        }
        return SUPPORTED_SCOPES.contains(scope);
    }

    public static String invalidScopeMessage(String scope) {
        return String.format(
                "Unsupported widget scope '%s'. Supported values: %s",
                scope, String.join(", ", SUPPORTED_SCOPES));
    }
}
