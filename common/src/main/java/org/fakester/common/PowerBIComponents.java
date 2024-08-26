package org.fakester.common;

import java.util.Set;

import com.inductiveautomation.perspective.common.api.BrowserResource;

public class PowerBIComponents {

    public static final String MODULE_ID = "org.fakester.powerbicomponents";
    public static final String URL_ALIAS = "powerbicomponents";
    public static final String COMPONENT_CATEGORY = "PowerBI Components";
    public static final Set<BrowserResource> BROWSER_RESOURCES =
        Set.of(
            new BrowserResource(
                "powerbi-components-js",
                String.format("/res/%s/PowerBIComponents.js", URL_ALIAS),
                BrowserResource.ResourceType.JS
            ),
            new BrowserResource("powerbi-components-css",
                String.format("/res/%s/PowerBIComponents.css", URL_ALIAS),
                BrowserResource.ResourceType.CSS
            )
        );
}
