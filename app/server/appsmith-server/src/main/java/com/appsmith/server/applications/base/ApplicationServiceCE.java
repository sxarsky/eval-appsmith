package com.appsmith.server.applications.base;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.Application;
import com.appsmith.server.domains.ApplicationMode;
import com.appsmith.server.domains.Artifact;
import com.appsmith.server.dtos.ApplicationAccessDTO;
import com.appsmith.server.dtos.GitAuthDTO;
import com.appsmith.server.services.CrudService;
import org.springframework.http.codec.multipart.Part;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ApplicationServiceCE extends CrudService<Application, String> {

    /**
     * Look up an application by id. The caller's ACL permissions are NOT applied;
     * use {@link #findById(String, AclPermission)} when permission filtering is needed.
     *
     * @param id the application id
     * @return a Mono emitting the application when found, otherwise empty
     */
    Mono<Application> getById(String id);

    /**
     * Look up an application by branched id, returning only the requested projection of fields.
     *
     * @param id                  the branched application id
     * @param projectionFieldNames the list of field names to project; may be empty to return all fields
     * @return a Mono emitting the projected application when found, otherwise empty
     */
    Mono<Application> findByBranchedId(String id, List<String> projectionFieldNames);

    Mono<Application> findById(String id);

    /**
     * Look up an application by id, applying the supplied ACL permission to the caller's
     * permission group memberships. Returns empty if the application does not exist or the
     * caller lacks the requested permission.
     *
     * @param id            the application id
     * @param aclPermission the permission required to read the application
     * @return a Mono emitting the application when found and accessible, otherwise empty
     */
    Mono<Application> findById(String id, AclPermission aclPermission);

    /**
     * Stream all applications in the given workspace that the caller can access under the
     * supplied permission.
     *
     * @param workspaceId the workspace id
     * @param permission  the permission required for each application to be included
     * @return a Flux of accessible applications, emitted in the repository's natural order
     */
    Flux<Application> findByWorkspaceId(String workspaceId, AclPermission permission);

    Flux<Application> findByWorkspaceIdAndBaseApplicationsInRecentlyUsedOrder(String workspaceId);

    Flux<Application> findByWorkspaceIdAndBaseApplicationsInAlphabeticalOrder(String workspaceId);

    Flux<Application> findByWorkspaceIdAndBaseApplicationsForHome(String workspaceId);

    Mono<Application> save(Artifact application);

    Mono<Application> updateApplicationWithPresets(String branchedApplicationId, Application application);

    Mono<Integer> updateByBranchedIdAndFieldsMap(String branchedApplicationId, Map<String, Object> fieldNameValueMap);

    Mono<Application> createBaseApplication(Application object);

    Mono<Application> archive(Application application);

    Mono<Application> changeViewAccessForSingleBranchByBranchedApplicationId(
            String branchedApplicationId, ApplicationAccessDTO applicationAccessDTO);

    Mono<Application> changeViewAccessForAllBranchesByBranchedApplicationId(
            String branchedApplicationId, ApplicationAccessDTO applicationAccessDTO);

    Flux<Application> findAllApplicationsByWorkspaceId(String workspaceId);

    Mono<Application> getApplicationInViewMode(String applicationId);

    Mono<Application> saveLastEditInformation(String applicationId);

    Mono<Application> setTransientFields(Application application);

    Mono<GitAuthDTO> getSshKey(String applicationId);

    Mono<Application> findByBranchNameAndBaseApplicationId(
            String branchName, String baseApplicationId, AclPermission aclPermission);

    Mono<String> findBranchedApplicationId(
            Optional<String> branchName, String baseApplicationId, Optional<AclPermission> permission);

    Mono<Application> findByBranchNameAndBaseApplicationId(
            String branchName,
            String baseApplicationId,
            List<String> projectionFieldNames,
            AclPermission aclPermission);

    Mono<String> findBranchedApplicationId(String branchName, String baseApplicationId, AclPermission permission);

    Flux<Application> findAllApplicationsByBaseApplicationId(String baseApplicationId, AclPermission permission);

    Flux<String> findAllBranchedApplicationIdsByBranchedApplicationId(
            String branchedApplicationId, AclPermission permission);

    Mono<Long> getGitConnectedApplicationsCountWithPrivateRepoByWorkspaceId(String workspaceId);

    String getRandomAppCardColor();

    Mono<Integer> setAppTheme(
            String applicationId, String editModeThemeId, String publishedModeThemeId, AclPermission aclPermission);

    Mono<Application> getApplicationByBaseApplicationIdAndDefaultBranch(String baseApplicationId);

    Mono<Application> findByIdAndExportWithConfiguration(String applicationId, Boolean exportWithConfiguration);

    Mono<Application> saveAppNavigationLogo(String branchedApplicationId, Part filePart);

    Mono<Void> deleteAppNavigationLogo(String branchedApplicationId);

    Mono<Boolean> isApplicationNameTaken(String applicationName, String workspaceId, AclPermission permission);

    Mono<Boolean> isApplicationConnectedToGit(String applicationId);

    Mono<Void> updateProtectedBranches(String applicationId, List<String> protectedBranches);

    Flux<String> findBranchedApplicationIdsByBaseApplicationId(String artifactId);

    Mono<Application> findByBaseIdBranchNameAndApplicationMode(
            String defaultApplicationId, String branchName, ApplicationMode mode);

    Mono<Application> findByBranchedApplicationIdAndApplicationMode(String branchedApplicationId, ApplicationMode mode);

    Flux<Application> findByUniqueAppName(String uniqueAppName, AclPermission aclPermission);

    Flux<Application> findByUniqueAppNameRefNameAndApplicationMode(
            String uniqueAppName, String refName, ApplicationMode applicationMode);
}
