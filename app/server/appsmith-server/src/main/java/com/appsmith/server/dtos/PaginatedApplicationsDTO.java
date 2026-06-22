package com.appsmith.server.dtos;

import com.appsmith.external.views.Views;
import com.appsmith.server.domains.Application;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Wrapper response for paginated `GET /applications/home` calls.
 *
 * <p>
 * Replaces the legacy flat {@code List<Application>} return shape. Callers that
 * still need the legacy shape can opt in via the {@code Accept-Version: v1}
 * request header.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedApplicationsDTO {

    @JsonView(Views.Public.class)
    private List<Application> items;

    @JsonView(Views.Public.class)
    private PaginationMeta pagination;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationMeta {
        @JsonView(Views.Public.class)
        private int page;

        @JsonView(Views.Public.class)
        private int pageSize;

        @JsonView(Views.Public.class)
        private long total;
    }
}
