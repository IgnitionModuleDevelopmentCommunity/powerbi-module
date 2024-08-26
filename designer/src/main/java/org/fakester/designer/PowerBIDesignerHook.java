package org.fakester.designer;

import com.inductiveautomation.ignition.common.BundleUtil;
import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.common.util.LoggerEx;
import com.inductiveautomation.ignition.designer.model.AbstractDesignerModuleHook;
import com.inductiveautomation.ignition.designer.model.DesignerContext;
import com.inductiveautomation.perspective.designer.DesignerComponentRegistry;
import com.inductiveautomation.perspective.designer.api.ComponentDesignDelegateRegistry;
import com.inductiveautomation.perspective.designer.api.PerspectiveDesignerInterface;
import org.fakester.common.component.display.PowerBIReport;
import org.python.antlr.op.Pow;


/**
 * The 'hook' class for the designer scope of the module.  Registered in the ignitionModule configuration of the
 * root build.gradle file.
 */
public class PowerBIDesignerHook extends AbstractDesignerModuleHook {
    private static final LoggerEx logger = LoggerEx.newBuilder().build("PowerBIComponents");

    private DesignerContext context;
    private DesignerComponentRegistry registry;
    private ComponentDesignDelegateRegistry delegateRegistry;

    static {
        BundleUtil.get().addBundle("powerbicomponents", PowerBIDesignerHook.class.getClassLoader(), "powerbicomponents");
    }

    public PowerBIDesignerHook() {
        logger.info("Registering PowerBI Components in Designer!");
    }

    @Override
    public void startup(DesignerContext context, LicenseState activationState) {
        this.context = context;
        init();
    }

    private void init() {
        logger.debug("Initializing registry entrants...");

        PerspectiveDesignerInterface pdi = PerspectiveDesignerInterface.get(context);

        registry = pdi.getDesignerComponentRegistry();

        // register components to get them on the palette
        registry.registerComponent(PowerBIReport.DESCRIPTOR);
        // register design delegates to get the special config UI when a component type is selected in the designer
    }


    @Override
    public void shutdown() {
        removeComponents();
    }

    private void removeComponents() {
        registry.removeComponent(PowerBIReport.COMPONENT_ID);
    }
}
