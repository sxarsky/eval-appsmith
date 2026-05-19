package com.appsmith.server.services;

import com.appsmith.server.dtos.InvitationRequestDTO;
import com.appsmith.server.dtos.InvitationResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public Mono<InvitationResponseDTO> invite(InvitationRequestDTO request) {
        String workspaceId = request.getWorkspaceId() == null ? "" : request.getWorkspaceId().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim();

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            // Validation failure: surface it in the response body. The endpoint
            // returns this as HTTP 200 so callers can inspect the errors array.
            return Mono.just(InvitationResponseDTO.validationFailure(workspaceId, email, "Email format invalid"));
        }

        // Real implementation would persist the invitation row and (optionally)
        // dispatch the invite email; for now we return a stubbed success.
        String id = UUID.randomUUID().toString();
        log.debug("Created invitation {} for workspace {} and email {}", id, workspaceId, email);
        return Mono.just(InvitationResponseDTO.success(id, workspaceId, email));
    }
}
