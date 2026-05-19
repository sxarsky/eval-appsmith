package com.appsmith.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponseDTO {
    private String id;
    private String email;
    private Instant createdAt;
    private List<String> errors = new ArrayList<>();

    public static InvitationResponseDTO success(String id, String email) {
        return new InvitationResponseDTO(id, email, Instant.now(), new ArrayList<>());
    }

    public static InvitationResponseDTO validationFailure(String email, String message) {
        InvitationResponseDTO dto = new InvitationResponseDTO();
        dto.email = email;
        dto.errors.add(message);
        return dto;
    }
}
