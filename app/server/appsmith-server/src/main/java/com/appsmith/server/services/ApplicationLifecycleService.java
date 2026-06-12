package com.appsmith.server.services;

import com.appsmith.server.applications.base.ApplicationService;
import com.appsmith.server.domains.Application;
import com.appsmith.server.domains.ApplicationLifecycleState;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import static com.appsmith.server.domains.ApplicationLifecycleState.ARCHIVED;
import static com.appsmith.server.domains.ApplicationLifecycleState.DRAFT;
import static com.appsmith.server.domains.ApplicationLifecycleState.PUBLISHED;
import static com.appsmith.server.domains.ApplicationLifecycleState.UNPUBLISHED;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationLifecycleService {

    public static final String INVALID_TRANSITION = "invalid_transition";

    private static final Map<Transition, Set<ApplicationLifecycleState>> ALLOWED_FROM;

    static {
        ALLOWED_FROM = new EnumMap<>(Transition.class);
        ALLOWED_FROM.put(Transition.PUBLISH, EnumSet.of(DRAFT, UNPUBLISHED));
        ALLOWED_FROM.put(Transition.UNPUBLISH, EnumSet.of(PUBLISHED));
        ALLOWED_FROM.put(Transition.ARCHIVE, EnumSet.of(DRAFT, UNPUBLISHED));
    }

    private final ApplicationService applicationService;

    public Mono<Application> publish(String applicationId) {
        return apply(applicationId, Transition.PUBLISH, PUBLISHED);
    }

    public Mono<Application> unpublish(String applicationId) {
        return apply(applicationId, Transition.UNPUBLISH, UNPUBLISHED);
    }

    public Mono<Application> archive(String applicationId) {
        return apply(applicationId, Transition.ARCHIVE, ARCHIVED);
    }

    public Flux<Application> listVisibleForCaller(String workspaceId, CallerRole role, boolean viewArchived) {
        return applicationService
                .findByWorkspaceId(workspaceId, null)
                .filter(app -> isVisible(role, ApplicationLifecycleState.fromNullable(app.getLifecycleState()), viewArchived));
    }

    public boolean isVisible(CallerRole role, ApplicationLifecycleState state, boolean viewArchived) {
        switch (state) {
            case PUBLISHED:
                return true;
            case DRAFT:
            case UNPUBLISHED:
                return role == CallerRole.EDITOR || role == CallerRole.OWNER;
            case ARCHIVED:
                return viewArchived;
            default:
                return false;
        }
    }

    private Mono<Application> apply(String applicationId, Transition transition, ApplicationLifecycleState target) {
        return applicationService
                .findById(applicationId)
                .switchIfEmpty(Mono.error(new AppsmithException(AppsmithError.NO_RESOURCE_FOUND, "application", applicationId)))
                .flatMap(application -> {
                    ApplicationLifecycleState current = ApplicationLifecycleState.fromNullable(application.getLifecycleState());
                    if (!ALLOWED_FROM.get(transition).contains(current)) {
                        return Mono.error(new AppsmithException(
                                AppsmithError.GENERIC_BAD_REQUEST,
                                INVALID_TRANSITION + ": " + current + " -> " + target));
                    }
                    application.setLifecycleState(target);
                    return applicationService.save(application);
                });
    }

    public enum Transition {
        PUBLISH,
        UNPUBLISH,
        ARCHIVE,
    }

    public enum CallerRole {
        OWNER,
        EDITOR,
        MEMBER,
    }
}
