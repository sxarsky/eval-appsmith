package com.appsmith.server.authorization;

import com.appsmith.server.domains.WorkspaceRole;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.Action.CREATE;
import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.Action.DELETE;
import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.Action.READ;
import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.Action.UPDATE;
import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.ResourceType.ACTION;
import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.ResourceType.APPLICATION;
import static com.appsmith.server.authorization.WorkspacePermissionEnforcer.ResourceType.PAGE;

@Component
public class WorkspacePermissionEnforcer {

    public static final String FORBIDDEN_ROLE = "forbidden_role";

    public enum ResourceType {
        APPLICATION,
        PAGE,
        ACTION,
    }

    public enum Action {
        CREATE,
        READ,
        UPDATE,
        DELETE,
    }

    private static final Map<WorkspaceRole, Map<ResourceType, Set<Action>>> MATRIX = new EnumMap<>(WorkspaceRole.class);

    static {
        Map<ResourceType, Set<Action>> admin = new EnumMap<>(ResourceType.class);
        admin.put(APPLICATION, EnumSet.allOf(Action.class));
        admin.put(PAGE, EnumSet.allOf(Action.class));
        admin.put(ACTION, EnumSet.allOf(Action.class));
        MATRIX.put(WorkspaceRole.ADMIN, admin);

        Map<ResourceType, Set<Action>> developer = new EnumMap<>(ResourceType.class);
        developer.put(APPLICATION, EnumSet.of(CREATE, READ, UPDATE));
        developer.put(PAGE, EnumSet.of(CREATE, READ, UPDATE));
        developer.put(ACTION, EnumSet.of(READ, UPDATE, DELETE));
        MATRIX.put(WorkspaceRole.DEVELOPER, developer);

        Map<ResourceType, Set<Action>> viewer = new EnumMap<>(ResourceType.class);
        viewer.put(APPLICATION, EnumSet.of(READ));
        viewer.put(PAGE, EnumSet.of(READ));
        viewer.put(ACTION, EnumSet.of(READ));
        MATRIX.put(WorkspaceRole.VIEWER, viewer);
    }

    public boolean isAllowed(WorkspaceRole role, ResourceType resource, Action action) {
        if (role == null) return false;
        Set<Action> allowed = MATRIX.get(role).get(resource);
        return allowed != null && allowed.contains(action);
    }

    /**
     * Throws an {@link AppsmithException} (HTTP 403, code {@value FORBIDDEN_ROLE}) when the
     * caller's role is not permitted to take the action on the given resource type.
     *
     * @throws AppsmithException for unauthenticated callers (null role, mapped to 401 upstream)
     *                           or insufficient role.
     */
    public void enforce(WorkspaceRole role, ResourceType resource, Action action) {
        if (role == null) {
            throw new AppsmithException(AppsmithError.UNAUTHORIZED_ACCESS);
        }
        if (!isAllowed(role, resource, action)) {
            throw new AppsmithException(
                    AppsmithError.GENERIC_BAD_REQUEST,
                    FORBIDDEN_ROLE + ": " + role + " cannot " + action + " " + resource);
        }
    }
}
