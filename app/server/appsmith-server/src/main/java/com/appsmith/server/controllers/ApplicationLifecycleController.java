package com.appsmith.server.controllers;

import com.appsmith.external.views.Views;
import com.appsmith.server.constants.Url;
import com.appsmith.server.domains.Application;
import com.appsmith.server.dtos.ResponseDTO;
import com.appsmith.server.services.ApplicationLifecycleService;
import com.appsmith.server.services.ApplicationLifecycleService.CallerRole;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping(Url.APPLICATION_URL)
@RequiredArgsConstructor
public class ApplicationLifecycleController {

    private final ApplicationLifecycleService lifecycleService;

    @JsonView(Views.Public.class)
    @PostMapping("/{id}/publish")
    public Mono<ResponseDTO<Application>> publish(@PathVariable String id) {
        return lifecycleService.publish(id).map(app -> new ResponseDTO<>(HttpStatus.OK, app));
    }

    @JsonView(Views.Public.class)
    @PostMapping("/{id}/unpublish")
    public Mono<ResponseDTO<Application>> unpublish(@PathVariable String id) {
        return lifecycleService.unpublish(id).map(app -> new ResponseDTO<>(HttpStatus.OK, app));
    }

    @JsonView(Views.Public.class)
    @PostMapping("/{id}/archive")
    public Mono<ResponseDTO<Application>> archive(@PathVariable String id) {
        return lifecycleService.archive(id).map(app -> new ResponseDTO<>(HttpStatus.OK, app));
    }

    @JsonView(Views.Public.class)
    @GetMapping("/lifecycle/workspace/{workspaceId}")
    public Mono<ResponseDTO<java.util.List<Application>>> listVisible(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "MEMBER") CallerRole role,
            @RequestParam(defaultValue = "false") boolean viewArchived) {
        Flux<Application> visible = lifecycleService.listVisibleForCaller(workspaceId, role, viewArchived);
        return visible.collectList().map(list -> new ResponseDTO<>(HttpStatus.OK, list));
    }
}
