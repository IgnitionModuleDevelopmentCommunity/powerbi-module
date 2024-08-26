package org.fakester.gateway;

import java.util.Optional;

import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.common.util.LoggerEx;
import com.inductiveautomation.ignition.gateway.dataroutes.RouteGroup;
import com.inductiveautomation.ignition.gateway.model.AbstractGatewayModuleHook;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.perspective.common.api.ComponentRegistry;
import com.inductiveautomation.perspective.gateway.api.ComponentModelDelegateRegistry;
import com.inductiveautomation.perspective.gateway.api.PerspectiveContext;
import org.fakester.common.PowerBIComponents;
import org.fakester.common.component.display.PowerBIReport;

public class PowerBIGatewayHook extends AbstractGatewayModuleHook {

    private static final LoggerEx log = LoggerEx.newBuilder().build("powerbi.gateway.PowerBIGatewayHook");

    private GatewayContext gatewayContext;
    private PerspectiveContext perspectiveContext;
    private ComponentRegistry componentRegistry;
    private ComponentModelDelegateRegistry modelDelegateRegistry;

    @Override
    public void setup(GatewayContext context) {
        this.gatewayContext = context;
        log.info("Setting up PowerBIComponents module.");
    }

    @Override
    public void startup(LicenseState activationState) {
        log.info("Starting up PowerBIGatewayHook!");

        this.perspectiveContext = PerspectiveContext.get(this.gatewayContext);
        this.componentRegistry = this.perspectiveContext.getComponentRegistry();
        this.modelDelegateRegistry = this.perspectiveContext.getComponentModelDelegateRegistry();


        if (this.componentRegistry != null) {
            log.info("Registering PowerBI components.");
            this.componentRegistry.registerComponent(PowerBIReport.DESCRIPTOR);

        } else {
            log.error("Reference to component registry not found, PowerBI Components will fail to function!");
        }

        if (this.modelDelegateRegistry != null) {
            log.info("Registering model delegates.");
        } else {
            log.error("ModelDelegateRegistry was not found!");
        }

    }

    @Override
    public void shutdown() {
        log.info("Shutting down PowerBIComponent module and removing registered components.");
        if (this.componentRegistry != null) {
            this.componentRegistry.removeComponent(PowerBIReport.COMPONENT_ID);

        } else {
            log.warn("Component registry was null, could not unregister PowerBI Components.");
        }
        if (this.modelDelegateRegistry != null ) {
            log.warn("ModelDelegateRegistry not null!");
        }

    }

    @Override
    public Optional<String> getMountedResourceFolder() {
        return Optional.of("mounted");
    }


    // Lets us use the route http://<gateway>/res/radcomponents/*
    @Override
    public Optional<String> getMountPathAlias() {
        return Optional.of(PowerBIComponents.URL_ALIAS);
    }

    @Override
    public boolean isFreeModule() {
        return true;
    }
}
