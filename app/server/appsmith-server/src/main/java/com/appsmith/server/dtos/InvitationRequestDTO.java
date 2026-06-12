package com.appsmith.server.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InvitationRequestDTO {
    @NotBlank
    private String workspaceId;

    @NotBlank
    private String email;
}
