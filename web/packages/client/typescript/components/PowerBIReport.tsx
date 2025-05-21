/**
 * Example of a component which displays an image, given a URL.
 */
import * as React from 'react';

import { models, Report, Embed, service} from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import { FilterType, IFilter, IAdvancedFilter, IBasicFilter, IIncludeExcludeFilter, IRelativeDateFilter, ITopNFilter, ITupleFilter, IRelativeTimeFilter, IIdentityFilter, IHierarchyFilter, ISettings, IVisualPropertySelector, IVisualPropertyValue } from 'powerbi-models'
import 'powerbi-report-authoring';

import {
    Component,
    ComponentMeta,
    ComponentProps,
    PComponent,
    PropertyTree,
    SizeObject
} from '@inductiveautomation/perspective-client';


// The 'key' or 'id' for this component type.  Component must be registered with this EXACT key in the Java side as well
// as on the client side.  In the client, this is done in the index file where we import and register through the
// ComponentRegistry provided by the perspective-client API.
export const COMPONENT_TYPE = "powerbi.display.powerbireport";


// This is the shape of the properties we get from the perspective 'props' property tree.
export interface reportDetailsProps {
	Id?: string,
	EmbedUrl?: string,
	Type?: string,
	EmbedToken?: {
		token: string,
		tokenId: string,
		expiration: string
	},
	MinutesToExpiration?: number,
	DefaultPage?: string,
	MobileDefaultPage?: string
}


export interface filter {
	$schema?: "",
	target?: {
		table: string,
		column: string
	},
	logicalOperator?: string,
	displaySettings?: {
		"isHiddenInViewMode": boolean
	},
	conditions?: [
		{
		operator: string,
		value: string
		},
		{
		operator: string,
		value: string
		}
	],
	operator?: string,
	values?: [],
	isExclude?: boolean,
	includeToday?: boolean,
	timeUnitType?: number,
	filterType: FilterType
}

export interface targetVisualObject {
	name: string;
	type: string;
}

export interface filterObject {
	reportFilters?: filter[];
	pageFilters?: filter[];
	visualFilters?: filter[];
	targetVisual?: targetVisualObject;
	applyFilters: boolean;
	removeFilters: boolean;
}

export interface visualDataObject {
	targetVisual?: targetVisualObject,
    limit?: number,
	type: number,
    data?: string,
    exportData?: boolean
}

export interface visualPropertiesObject {
	targetVisual: targetVisualObject,
	selectors: object[],
	values: object[],
	applyProperties: boolean,
	resetProperties: boolean
}

export interface PowerBIProps {
	tenantID : string;
	clientID : string;
	clientSecret : string;
	workspaceID : string;
	reportID : string;
	reportName? : string;
	reportSettings? : object;
	reportDetails? : reportDetailsProps;
	reloadReport : boolean;
	toggleReloadReport(value: boolean): void;
	reportLoaded? : boolean;
	toggleReportLoaded(value: boolean): void;
	filters? : filterObject;
	toggleApply(value: boolean): void;
	toggleRemove(value: boolean): void;
	visualData? : visualDataObject;
	setData(value: string): void;
	toggleExport(value: boolean): void;
	visualProperties?: visualPropertiesObject;
	toggleApplyProps(value: boolean): void;
	toggleReset(valie: boolean): void;
	selectedData? : object;
	setSelected(value: object): void;
	status?: object;
	setStatus(value: object): void;
}


function ReturnReport (ReportProps: PowerBIProps): JSX.Element {

	// PowerBI Report object (to be received via callback)
	const [report, setReport] = React.useState<Report>();

	// Track Report embedding status
	const [isEmbedded, setIsEmbedded] = React.useState<boolean>(false);

	// CSS Class to be passed to the embedded component
	const reportClass = 'report-container';

	// Pass the basic embed configurations to the embedded component to bootstrap the report on first load
	// Values for properties like embedUrl, accessToken and settings will be set on click of button
	const [ReportConfig, setReportConfig] = React.useState<models.IReportEmbedConfiguration>({
		type: 'report',
		embedUrl: undefined,
		tokenType: models.TokenType.Embed,
		accessToken: undefined,
		settings: undefined,
	});

	const setLoaded = (ReportProps: PowerBIProps, value: boolean) : void =>{
		ReportProps.toggleReportLoaded(value);
		console.info("reportLoaded set to " + value)
	}

	const setReload = (ReportProps: PowerBIProps, value: boolean) : null =>{
		ReportProps.toggleReloadReport(value);
		console.info("reloadReport set to " + value)
		return null;
	}

	const setApply = (ReportProps: PowerBIProps, value: boolean) : void =>{
		ReportProps.toggleApply(value);
		console.info("applyFilters set to " + value)
	}

	const setRemove = (ReportProps: PowerBIProps, value: boolean) : void =>{
		ReportProps.toggleRemove(value);
		console.info("removeFilters set to " + value)
	}

	const setData = (ReportProps: PowerBIProps, value: string) : void =>{
		ReportProps.setData(value);
		console.info("visual data selected set")
	}

	const setExport = (ReportProps: PowerBIProps, value: boolean) : void =>{
		ReportProps.toggleExport(value);
		console.info("export data set to " + value)
	}

	const setApplyProps = (ReportProps: PowerBIProps, value: boolean) : void =>{
		ReportProps.toggleApplyProps(value);
		console.info("applyProperties set to " + value)
	}

	const setReset = (ReportProps: PowerBIProps, value: boolean) : void =>{
		ReportProps.toggleReset(value);
		console.info("resetProperties set to " + value)
	}

	const setSelectedData = (ReportProps: PowerBIProps, value: object) : void =>{
		ReportProps.setSelected(value);
		console.info("selected data set")
	}

	const setStatus = (ReportProps: PowerBIProps, value: object) : void =>{
		ReportProps.setStatus(value);
		console.info("status set to " + value)
	}

	async function exportData(report: Report, type: number, limit: number, targetVisual: targetVisualObject) {
		
		try {
			const pages = await report.getPages();
			const activePage = pages.filter(page => page.isActive)[0];
			const visuals = await activePage.getVisuals();

			visuals.forEach(async visual => {
				if (visual.name == targetVisual.name && visual.type == targetVisual.type){
					const selectedVisual = visual
					let data = await selectedVisual.exportData(type, limit);
					setData(ReportProps, data.data)
					console.info("exporting data from visual " + selectedVisual.name)

					const selector = { 
						objectName: "view",
						propertyName: "zoom"
					};

					console.log("Attempting to get view/zoom property from visual")
					let property = await visual.getProperty(selector)
					visual.setProperty
					console.log(property)
				}
			});

			setExport(ReportProps, false)
		}	

		catch (errors) {
		  	console.error("Error getting data from " + targetVisual.name, errors);
		}
	}

	async function applyProperties(report: Report, type: string, targetVisual: targetVisualObject, selectors: IVisualPropertySelector[], values: IVisualPropertyValue[]) {
		
		try {
			const pages = await report.getPages();
			const activePage = pages.filter(page => page.isActive)[0];
			const visuals = await activePage.getVisuals();

			visuals.forEach(async visual => {
				if (visual.name == targetVisual.name && visual.type == targetVisual.type){
					const selectedVisual = visual

					console.log("Attempting to set properties on visual " + targetVisual.name + "" + targetVisual.type)
					
					for (let item = 0; item < selectors.length; item++){
						if (type == "Reset") {
							await selectedVisual.resetProperty(selectors[item])
							console.info(selectors[item].objectName + "/" +selectors[item].propertyName + " reset")
						}
						else if (type == "Apply") {
							await selectedVisual.setProperty(selectors[item], values[item])
							console.info(selectors[item].objectName + "/" +selectors[item].propertyName + " set to " + values[item].value)
						}
					}
					setApplyProps(ReportProps, false)
					setReset(ReportProps, false)
				}
			});
		}	
		catch (errors) {
		  	console.error("Error setting properties on " + targetVisual.name, errors);
		}
	}



	async function applyFilters(report: Report, filters: filter[], target: string, type: string, targetVisual: targetVisualObject) {
		const FilterSchema = [
			"advanced",
			"basic",
			"unknown",
			"includeExclude",
			"relativeDate",
			"topN",
			"tuple",
			"relativeTime",
			"identity",
			"hierarchy"
		]
		
		const newFilters: IFilter[] = []
		for (let item = 0; item < filters.length; item++){
			if (filters[item].filterType == 0){
				var advancedFilter: IAdvancedFilter = filters[item] as IAdvancedFilter
				advancedFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(advancedFilter);
			}
			else if (filters[item].filterType == 1){
				var basicFilter: IBasicFilter = filters[item] as IBasicFilter
				basicFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(basicFilter);
			}
			else if (filters[item].filterType == 3){
				var includeExcludeFilter: IIncludeExcludeFilter = filters[item] as IIncludeExcludeFilter
				includeExcludeFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(includeExcludeFilter);
			}
			else if (filters[item].filterType == 4){
				var relativeDateFilter: IRelativeDateFilter = filters[item] as unknown as IRelativeDateFilter
				relativeDateFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(relativeDateFilter);
			}
			else if (filters[item].filterType == 5){
				var topNFilter: ITopNFilter = filters[item] as ITopNFilter
				topNFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(topNFilter);
			}
			else if (filters[item].filterType == 6){
				var tupleFilter: ITupleFilter = filters[item] as unknown as ITupleFilter
				tupleFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(tupleFilter);
			}
			else if (filters[item].filterType == 7){
				var relativeTimeFilter: IRelativeTimeFilter = filters[item] as unknown as IRelativeTimeFilter
				relativeTimeFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(relativeTimeFilter);
			}
			else if (filters[item].filterType == 8){
				var identityFilter: IIdentityFilter = filters[item] as unknown as IIdentityFilter
				identityFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(identityFilter);
			}
			else if (filters[item].filterType == 9){
				var hierarchyFilter: IHierarchyFilter = filters[item] as unknown as IHierarchyFilter
				hierarchyFilter["$schema"] = "https://powerbi.com/product/schema#" + FilterSchema[filters[item].filterType]
				newFilters.push(hierarchyFilter);
			}

	
		}

		try {
			if (target == "Report"){
				if (type == "Remove"){
					console.info("Removing all filters on report")
					await report.updateFilters(0);
				}
				else if (type == "Replace") {
					console.info("Replacing filters on report with " + newFilters.length + " new filters")
					await report.updateFilters(1, newFilters)
				}
			}
			else if (target == "Page"){
				const pages = await report.getPages();
				const activePage = pages.filter(page => page.isActive)[0];
				
				if (type == "Remove"){
					console.info("Removing all filters on current page")
					await activePage.updateFilters(0);
				}
				else if (type == "Replace") {
					console.info("Replacing filters on current page with " + newFilters.length + " new filters")
					await activePage.updateFilters(1, newFilters)
				}		
			}
			else if (target == "Visual"){
				const pages = await report.getPages();
				const activePage = pages.filter(page => page.isActive)[0];
				const visuals = await activePage.getVisuals();

				visuals.forEach(visual => {
					console.info(`Visual Name: ${visual.name}, Type: ${visual.type}`);
					if (visual.name == targetVisual.name && visual.type == targetVisual.type){
						const selectedVisual = visual
						if (type == "Remove"){
							console.info("Removing all filters on visual " + visual.type + " " + visual.name)
							selectedVisual.updateFilters(0);
						}
						else if (type == "Replace") {
							console.info("Replacing filters on  on visual " + visual.type + " " + visual.name + " with " + newFilters.length + " new filters")
							selectedVisual.updateFilters(1, newFilters)
						}

					}
				});
			}

			setApply(ReportProps, false)
			setRemove(ReportProps, false)

			
			
		} catch (errors) {
		  	console.error("Error setting filters on " + target, errors);
		}
	  }
 
	

	/**
	 * Map of event handlers to be applied to the embedded report
	 * Update event handlers for the report by redefining the map using the setEventHandlersMap function
	 * Set event handler to null if event needs to be removed
	 * More events can be provided from here
	 * https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/handle-events#report-events
	 */
	const[eventHandlersMap] = React.useState<Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>>(new Map([
		['loaded', () => {
			console.info('Report has loaded');
			setStatus(ReportProps, {"type": "loaded", "timestamp": Date.now()})
			},
		],
		['rendered', () => {
			console.info('Report has rendered');
			setLoaded(ReportProps, true);	
			setStatus(ReportProps, {"type": "rendered", "timestamp": Date.now()})		
			},
		],
		['error', (event?: service.ICustomEvent<any>) => {
				if (event) {
					console.error(event.detail);
				}
			},
		],
		['dataSelected', (event) => {
			if (event?.detail.dataPoints.length) {
				setSelectedData(ReportProps, event.detail);
				setStatus(ReportProps, {"type": "dataSelected", "timestamp": Date.now()})
			} else {
				setSelectedData(ReportProps, {});
			}
			
		}],
		['visualClicked', () => {
			console.info('visual clicked')
			setStatus(ReportProps, {"type": "visualClicked", "timestamp": Date.now()})
		}],
		['pageChanged', (event) => console.info(event)],
	]));


	React.useEffect(() => {
		if (ReportProps.reportDetails?.EmbedUrl && ReportProps.reportDetails.EmbedToken?.token) {
			console.info("attempting to embed report")
			embedReport("", "", {})
		}
		if (report) {
			report.setComponentTitle('Embedded Report');
		}
	}, [report]);

	React.useEffect(() => {
		if (ReportProps.filters?.applyFilters && ReportProps.filters?.visualFilters?.length) {
			if (report) {
				applyFilters(report, ReportProps.filters.visualFilters, "Visual", "Replace", ReportProps.filters.targetVisual as targetVisualObject);
			}
		}
		else if (ReportProps.filters?.applyFilters && ReportProps.filters?.pageFilters?.length) {
			if (report) {
				applyFilters(report, ReportProps.filters.pageFilters, "Page", "Replace", ReportProps.filters.targetVisual as targetVisualObject);
			}
		}
		else if (ReportProps.filters?.applyFilters && ReportProps.filters?.reportFilters?.length) {
			if (report) {
				applyFilters(report, ReportProps.filters.reportFilters, "Report", "Replace", ReportProps.filters.targetVisual as targetVisualObject);
			}
		}
		else if (ReportProps.filters?.removeFilters && ReportProps.filters?.visualFilters?.length) {
			if (report) {
				applyFilters(report, ReportProps.filters.visualFilters, "Visual", "Remove", ReportProps.filters.targetVisual as targetVisualObject);
			}
		}
		else if (ReportProps.filters?.removeFilters && ReportProps.filters?.pageFilters?.length) {
			if (report) {
				applyFilters(report, ReportProps.filters.pageFilters, "Page", "Remove", ReportProps.filters.targetVisual as targetVisualObject);
			}
		}
		else if (ReportProps.filters?.removeFilters && ReportProps.filters?.reportFilters?.length) {
			if (report) {
				applyFilters(report, ReportProps.filters.reportFilters, "Report", "Remove", ReportProps.filters.targetVisual as targetVisualObject);
			}
		}
	}, [ReportProps.filters]);

	// Check for changed token, and set report to use it to prevent report from expiring
	React.useEffect(() => {
		if (ReportProps.reportDetails?.EmbedToken?.token){
			if (report) {
				report.setAccessToken(ReportProps.reportDetails.EmbedToken.token)
				console.info("setting new access token that expires " + ReportProps.reportDetails.EmbedToken.expiration)
			}
			else {
				embedReport("", "", {})
			}
		}
	}, [ReportProps.reportDetails?.EmbedToken?.expiration]);

	// Check for changed settings, and set report to those new settings
	React.useEffect(() => {
		if (ReportProps.reportSettings){
			if (report) {
				report.updateSettings(ReportProps.reportSettings as ISettings)
				console.info("setting new report settings")
			}
		}
	}, [ReportProps.reportSettings]);

	// check for exportData set to true and export the data from selected visual
	React.useEffect(() => {
		if (ReportProps.visualData?.exportData){
			if (report) {
				var limit = 20
				if (ReportProps.visualData.limit){
					limit = ReportProps.visualData.limit
				}
				exportData(report, ReportProps.visualData.type, limit, ReportProps.visualData.targetVisual as targetVisualObject)
				console.info("exporting data from target visual")
			}
		}
	}, [ReportProps.visualData?.exportData]);

	// check for apply properties set to true and applies properties to target visual
	React.useEffect(() => {
		if (ReportProps.visualProperties?.selectors){
			if (report) {
				applyProperties(report, "Apply", ReportProps.visualProperties.targetVisual as targetVisualObject, ReportProps.visualProperties.selectors as IVisualPropertySelector[], ReportProps.visualProperties.values as IVisualPropertyValue[])
				console.info("applying " + ReportProps.visualProperties.selectors.length + " properties to target visual")
			}
		}
	}, [ReportProps.visualProperties?.applyProperties]);


	// check for apply properties set to true and applies properties to target visual
	React.useEffect(() => {
		if (ReportProps.visualProperties?.selectors){
			if (report) {
				applyProperties(report, "Reset", ReportProps.visualProperties.targetVisual as targetVisualObject, ReportProps.visualProperties.selectors as IVisualPropertySelector[], ReportProps.visualProperties.values as IVisualPropertyValue[])
				console.info("resetting " + ReportProps.visualProperties.selectors.length + " properties to target visual")
			}
		}
	}, [ReportProps.visualProperties?.resetProperties]);


	/**
	 * Embeds report
	 */
	const embedReport = (embedUrl: string, accessToken: string, settings: object): void => {
		// Update the reportConfig to embed the PowerBI report
		if (ReportProps.reportDetails?.EmbedUrl && ReportProps.reportDetails.EmbedToken?.token){
			embedUrl = ReportProps.reportDetails.EmbedUrl
			accessToken = ReportProps.reportDetails.EmbedToken.token
		}
		if (ReportProps.reportSettings){
			settings = ReportProps.reportSettings
		}
		setReportConfig({
			...ReportConfig,
			embedUrl,
			accessToken,
			settings
		});
		setIsEmbedded(true);
		setLoaded(ReportProps, false);
		setSelectedData(ReportProps, {});
	};



	const reportComponent =
		<PowerBIEmbed
			embedConfig = { ReportConfig }
			eventHandlers = { eventHandlersMap }
			cssClassName = { reportClass }
			getEmbeddedComponent = { (embedObject: Embed) => {
				console.info(`Embedded object of type "${ embedObject.embedtype }" received`);
				setReport(embedObject as Report);
			} }
		/>;

	return (
		<div className = "report-container">
			{ isEmbedded && !ReportProps.reloadReport? reportComponent : setReload(ReportProps, false)}
		</div>
	);
}


export class PowerBIReport extends Component<ComponentProps<PowerBIProps>, any> {
	

    render() {
		const { props, emit } = this.props;
		return (
			<div { ...emit()}>
				< ReturnReport{...props} />
            </div>
        );

    }
}


// This is the actual thing that gets registered with the component registry.
export class PowerBIReportMeta implements ComponentMeta {

    getComponentType(): string {
        return COMPONENT_TYPE;
    }

    // the class or React Type that this component provides
    getViewComponent(): PComponent {
        return PowerBIReport;
    }

    getDefaultSize(): SizeObject {
        return ({
            width: 500,
            height: 500
        });
    }

    // Invoked when an update to the PropertyTree has occurred,
    // effectively mapping the state of the tree to component props.
    getPropsReducer(tree: PropertyTree): PowerBIProps {
        return {
			tenantID : tree.readString("tenantID", ""),
			clientID : tree.readString("clientID", ""),
			clientSecret : tree.readString("clientSecret", ""),
			workspaceID : tree.readString("workspaceID", ""),
			reportID : tree.readString("reportID", ""),
			reportName : tree.readString("reportName", ""),
			reportSettings: tree.readObject("reportSettings", {}),
			reportDetails : tree.readObject("reportConfig",{}),
			reloadReport: tree.readBoolean("reloadReport", false),
			toggleReloadReport: (value: boolean) => tree.write("reloadReport", value),
			reportLoaded: tree.readBoolean("reportLoaded", false),
			toggleReportLoaded: (value: boolean) => tree.write("reportLoaded", value),
			filters: tree.readObject("filters", {}) as filterObject,
			toggleApply: (value: boolean) => tree.write("filters.applyFilters", value),
			toggleRemove: (value: boolean) => tree.write("filters.removeFilters", value),
			visualData: tree.readObject("visualData", {}) as visualDataObject,
			setData: (value: string) => tree.write("visualData.data", value),
			toggleExport: (value: boolean) => tree.write("visualData.exportData", value),
			visualProperties: tree.readObject("visualProperties", {}) as visualPropertiesObject,
			toggleApplyProps: (value: boolean) => tree.write("visualProperties.applyProperties", value),
			toggleReset: (value: boolean) => tree.write("visualProperties.resetProperties", value),
			selectedData: tree.readObject("selectedData", {}),
			setSelected: (value: object) => tree.write("selectedData", value),
			status: tree.readObject("status", {}),
			setStatus: (value: object) => tree.write("status", value),

        };
    }
}
