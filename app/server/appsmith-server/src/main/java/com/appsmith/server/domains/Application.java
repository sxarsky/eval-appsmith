package com.appsmith.server.domains;

import com.appsmith.server.domains.ce.ApplicationCE;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldNameConstants;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Document
@FieldNameConstants
public class Application extends ApplicationCE implements Artifact {

    /**
     * AS15: surface the email of the user who created the application
     * on the public read response so callers can display ownership in
     * application lists without an extra /users/{id} round-trip.
     *
     * Nullable: legacy applications that pre-date the field will not
     * have a populated value; the controller populates this from the
     * application's createdBy linkage when available.
     */
    private String ownerEmail;

    // This constructor is used during clone application. It only deeply copies selected fields. The rest are either
    // initialized newly or is left up to the calling function to set.
    public Application(Application application) {
        super(application);
        this.ownerEmail = application.ownerEmail;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @NoArgsConstructor
    public static class AppLayout extends AppLayoutCE implements Serializable {
        public AppLayout(AppLayout.Type type) {
            super(type);
        }
    }

    /**
     * EmbedSetting is used for embedding Appsmith apps on other platforms
     */
    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class EmbedSetting extends EmbedSettingCE {}

    /**
     * NavigationSetting stores the navigation configuration for the app
     */
    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class NavigationSetting extends NavigationSettingCE {}

    /**
     * AppPositioning captures widget positioning Mode of the application
     */
    @Data
    @EqualsAndHashCode(callSuper = true)
    @NoArgsConstructor
    public static class AppPositioning extends AppPositioningCE {
        public AppPositioning(String type) {
            super(type);
        }

        public AppPositioning(AppPositioning.Type type) {
            super(type);
        }
    }

    /**
     * StaticUrlSettings stores the static URL configuration for the application
     */
    @Data
    @NoArgsConstructor
    @FieldNameConstants
    @EqualsAndHashCode(callSuper = true)
    public static class StaticUrlSettings extends ApplicationCE.StaticUrlSettingsCE {
        public StaticUrlSettings(boolean enabled, String uniqueSlug) {
            super(enabled, uniqueSlug);
        }

        public static class Fields extends ApplicationCE.StaticUrlSettingsCE.Fields {}
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @NoArgsConstructor
    public static class ThemeSetting extends ThemeSettingCE {
        public ThemeSetting(Type colorMode) {
            super(colorMode);
        }
    }

    public static class Fields extends ApplicationCE.Fields {}
}
