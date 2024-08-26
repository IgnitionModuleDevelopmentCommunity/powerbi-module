/**
 * Example of a component which displays an image, given a URL.
 */
import * as React from 'react';

//import { models, Report, Embed, service, Page } from 'powerbi-client';
import { models, Report, Embed } from 'powerbi-client';
//import { IHttpPostMessageResponse } from 'http-post-message';
import { PowerBIEmbed } from './powerbi-client-react';
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
export interface PowerBIProps {
	tenantID : string;
	clientID : string;
	clientSecret : string;
	workspaceID : string;
	reportID : string;
	reportName : string;
	reportConfig: object;
}

export class PowerBIReport extends Component<ComponentProps<PowerBIProps>, any> {
	
    render() {
		const { props, emit } = this.props;

		
        // The props we're interested in.
		// "tenant id",
        //"client id",
        //"client secret",
        //"workspace id",
        //"report id"
		
		// Note that the topmost piece of dom requires the application of an element reference, events, style and
        // className as shown below otherwise the layout won't work, or any events configured will fail. See render
        // of MessengerComponent in Messenger.tsx for more details.
		
		/*
		const reportPost = {
			"Id": "16ee7cce-53a7-44c4-bb3e-20dc99cd436b",
			"EmbedUrl": "https://app.powerbi.com/reportEmbed?reportId=16ee7cce-53a7-44c4-bb3e-20dc99cd436b&groupId=c1ff9e8e-9ec2-46b2-8cf9-d9266325e4f6&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUNFTlRSQUwtQi1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
			"Type": "report",
			"EmbedToken": {
				"token": "H4sIAAAAAAAEAB2Ut7KEVhBE_-WlqApYFqcqBXjvPRnew108q9K_60lJRxN0n5npv3_s7BmXrPz584cfgq-DOZ5NdwVtF4gz8fuY0n5rG3OShg1OT_PwzeYpYQmkLs2gsFWuVvXdz55C2XJO-NZUVAi9s237xe0a_TaMpnPm-QhwM_GVnljcgc1bc3haqcYcECdzbPPSWgnS0jW1MPbnAzPQoxp-RLUNnAfu4SeiQ0NjjTu-4fL3r8GtLGEV3pfQgKZljnurakb8DO681UyNQi5-r0M_uOzOcosZ591W1jqOKauTeF_dG4fzh0TuXga6kzss2ApMgQDq0rETOjEljoTSuKKLnxrbLb0eBu4VZ9fxq95vwkRqB9ybGwuGNqjx2qmeUYQ8uScphFYrNzB6OFuRzaOgvT7Ke8WVnimoYggVjMGrs-sBPk8ncDjdBKy9b31H3fuemt7-VrKQZyH0MxgEcryCQ0edgu6fPJqkXpnKm2BQubxsl6P1ZlkiNKe4zP2ipW0qFCpLkVWu0Meroz6RFQ2dvUwXbcmTinhM3hOJd8yRsE7aQi0QUbXWz9fuhsrxKlY71sQXvHehodIDo5LTebRxZlhdSWeYVeZjPbtADDOSl9Ok14ZkG-HDPZjwthDmMqV0raSSMufvJEcbFx_iVBxDoPWq-85L3Ggog5YVXo_eihpBEh_RwJKG-Varh-5eoh4XGEFTBKyZPHiNl7_q1jLQvhn5Poa3zMNwm8OMuFtKIJSkecSc0loqUF1nU0SRGdx7MuR3eHh4rpJBgG2kxLgGSSYv-ftdOFZVc7du3HD5aGoSxSQ4r79-_vjh1gfsi1Y9v6dfqlailYczpi7MssSeM4IBavJ69ppfcx4AxUnNjwT5buwfUWtt4PG_6-XBiV5-auvqO2gwMkRgiFSUfBcJ3jLqfLvNMJLXWnibrLLDexCtkV0x0hMvuLhXmz37LjplIezlVKPuPro_QztKzEBLHgmV3dLExZAz5TUwfU0SE2ZtSUS6ImQFNusKWSD1ERV-ADea9okWL2nJC2q14PSmBnC46aLes8qcay4-lHgorwi1EA_jiSIu-fn3LYFukT57vg1O6ED5rOs8gIRUm_Eo0qA7Sgx8phW5GaXWSzzhsIcO_DbKcAOumtmAcVyYw3cvGmpnr5i0qBiQ3-vEzq09oZB4BM1f_2N-QFutSvhfwXAetMvsXJPTR96lVYV1NWL-n_K6Zs72Y63-W8bwXfOVV--E_1ig4qp8zwH9vEtPh2rJqlijwVKe0OW8FUCL-7SfoRO0aXJZIeLqU7cYPS5kaGevyXXmPREyNehc89S09Woozr51h7AowEoty_w3_1Rypm3Y98583h41VBS0yF0qX2ohI3aZHq5Iszl5mV7oeBXh6Hx7RrgNBiS8Xv1NE4D_tovw0YXwbnPWFy7aIfI3YU9as9NoIM4Hhm9b-dsVi2WqGcfmzktfXsa9Uf3zdor9Ug3PrFXY2kqDXhhf_1jptIplZ7Ts2SHlPg9S4GmqS0wOAvtPF-61qZZoCz77rqCSS-Sk4p_wk391q_s8IO0kE0O8yG_WRHraV_rgifOL-Z9_AbJ9isHuBQAA.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUNFTlRSQUwtQi1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZXhwIjoxNzE3NDQyMDc5LCJhbGxvd0FjY2Vzc092ZXJQdWJsaWNJbnRlcm5ldCI6dHJ1ZX0=",
				"tokenId": "fdcb9543-1c29-4b7c-8164-3d70c5f68c74",
				"expiration": "2024-06-03T19:14:39Z"
			},
			"MinutesToExpiration": 55,
			"DefaultPage": null,
			"MobileDefaultPage": null
			};
		
		*/

		function DemoApp({reportDetails=props.reportConfig}: any): JSX.Element {

			// PowerBI Report object (to be received via callback)
			const [report, setReport] = React.useState<Report>();
		
			// CSS Class to be passed to the embedded component
			const reportClass = 'report-container';

			const ReportConfig = {
				type: 'report',
				embedUrl: reportDetails.EmbedUrl,
				tokenType: models.TokenType.Embed,
				accessToken: reportDetails.EmbedToken.token,
				settings: undefined,
			};
			

			React.useEffect(() => {
				if (report) {
					report.setComponentTitle('Embedded Report');
				}
			}, [report]);
		
			const reportComponent =
				<PowerBIEmbed
					embedConfig = { ReportConfig }
					//eventHandlers = { eventHandlersMap }
					cssClassName = { reportClass }
					getEmbeddedComponent = { (embedObject: Embed) => {
						console.log(`Embedded object of type "${ embedObject.embedtype }" received`);
						setReport(embedObject as Report);
					} }
				/>;
		
		
			return (
				<div className='report-container'>
					{ reportComponent }
				</div>
			);
		}
			

        return (
			<div { ...emit({ classes: ["container"] })}>
				< DemoApp />
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
			reportConfig : tree.readObject("reportConfig", {})
        };
    }
}
