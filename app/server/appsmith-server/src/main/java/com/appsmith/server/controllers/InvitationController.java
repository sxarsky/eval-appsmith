package com.appsmith.server.controllers;

import com.appsmith.external.views.Views;
import com.appsmith.server.dtos.InvitationRequestDTO;
import com.appsmith.server.dtos.InvitationResponseDTO;
import com.appsmith.server.dtos.ResponseDTO;
import com.appsmith.server.services.InvitationService;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/v1/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @JsonView(Views.Public.class)
    @GetMapping
    public Mono<ResponseDTO<Map<String, String>>> info() {
        // Probe / metadata endpoint. Returns a small descriptor so callers
        // (and runtime health checks) can verify the controller is wired
        // without needing to submit an invitation.
        return Mono.just(new ResponseDTO<>(
                HttpStatus.OK,
                Map.of(
                        "endpoint", "/v1/invitations",
                        "method", "POST",
                        "body", "{workspaceId, email}")));
    }

    @JsonView(Views.Public.class)
    @PostMapping
    public Mono<ResponseDTO<InvitationResponseDTO>> invite(
            @Valid @RequestBody InvitationRequestDTO request) {
        return invitationService
                .invite(request)
                .map(payload -> new ResponseDTO<>(HttpStatus.OK, payload));
    }
}
