# PowerBI Module #
This module adds a component to Perspective that allows users to embed a PowerBI Report using the [App Owns Data](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/embedding-solutions) method to authorize the Ignition instance to control access to the report (and workspace) without requiring each user to log in to a PowerBI Pro account.

In order to use, install the signed (or unsigned) .modl file from [the build folder](build)

The module shows up under IA Systems Engineering (self-signed certificate)

![image](https://github.com/user-attachments/assets/54ecf052-7df9-4a47-92a1-3b9ab13b18f0)

In the designer, the PowerBI Report appears under the PowerBI Components header.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/36326e00-d959-44ef-8d0b-502c2c7f752b)

In order to embed a report, you need to provide the component with the reportConfig property which also requires your Tenant ID, Client ID, Client Secret. Workspace ID, and Report ID.

![image](https://github.com/user-attachments/assets/9af4f3a4-127a-4b00-bea7-b625d0ac4dbc)

The reportConfig property is currently not implemented as part of the module due to issues with authentication with the PowerBI REST API. Currently the easiest way to get that reportConfig is to use the binding on the provided [test view](PowerBITestView) 

Which is reproduced here for convenience:
```
{
  "type": "expr-struct",
  "config": {
    "struct": {
      "clientID": "{this.props.clientID}",
      "clientSecret": "{this.props.clientSecret}",
      "reportID": "{this.props.reportID}",
      "tenantID": "{this.props.tenantID}",
      "workspaceID": "{this.props.workspaceID}"
    },
    "waitOnAll": true
  },
  "transforms": [
    {
      "code": "\timport urllib\n\t\t\n\ttenantID \u003d value.tenantID\n\tclientID \u003d value.clientID\n\tclientSecret \u003d value.clientSecret\n\tworkspaceID \u003d value.workspaceID\n\treportID \u003d value.reportID\n\t\n\t#Step 1 - get access token\n\turl \u003d \"https://login.microsoftonline.com/\" + tenantID + \"/oauth2/v2.0/token\"\n\t\n\tdata \u003d urllib.urlencode({\n\t\u0027client_secret\u0027: clientSecret,\n\t\u0027grant_type\u0027:\u0027client_credentials\u0027,\n\t\u0027client_id\u0027:clientID,\n\t\u0027scope\u0027:\u0027https://analysis.windows.net/powerbi/api/.default\u0027\n\t})\n\theaders \u003d {\n\t  \u0027Content-Type\u0027: \u0027application/x-www-form-urlencoded\u0027\n\t}\n\t\n\thttp \u003d system.net.httpClient()\n\tresponseStep1 \u003d http.post(url\u003durl, data\u003ddata, headers\u003dheaders)\n\t\n\t#system.perspective.print(responseStep1.json)\n\taccessToken \u003d responseStep1.json[\u0027access_token\u0027]\n\tif not responseStep1.good:\n\t   system.perspective.print(\u0027Error on step 1\u0027)\n\t   \n\t#Step 2 - get embedURL and report details\n\turl \u003d \"https://api.powerbi.com/v1.0/myorg/groups/\" + workspaceID + \"/reports/\" + reportID\n\t\n\theaders \u003d {\n\t  \u0027Authorization\u0027: \u0027Bearer \u0027 + accessToken \n\t}\n\t\n\tresponseStep2 \u003d http.get(url\u003durl, headers\u003dheaders)\n\t#system.perspective.print(responseStep2.json)\n\t\n\t#Step 3 - get embed token and report config\n\turl \u003d \"https://api.powerbi.com/v1.0/myorg/groups/\" + workspaceID + \"/reports/\" + reportID + \"/GenerateToken\"\n\t\n\tdata \u003d {\"accessLevel\": \"View\"}\n\theaders \u003d {\n\t  \u0027Authorization\u0027: \u0027Bearer \u0027 + accessToken,\n\t  \u0027Content-Type\u0027: \u0027application/json\u0027\n\t}\n\t\n\tresponseStep3 \u003d http.post(url\u003durl, data\u003ddata, headers\u003dheaders)\n\t#system.perspective.print(responseStep3.json)\n\t\n\treportPost \u003d {\n\t\t\"Id\": reportID,\n\t\t\"EmbedUrl\": responseStep2.json[\u0027embedUrl\u0027],\n\t\t\"Type\": \"report\",\n\t\t\"EmbedToken\": {\n\t\t\t\"token\": responseStep3.json[\u0027token\u0027],\n\t\t\t\"tokenId\": responseStep3.json[\u0027tokenId\u0027],\n\t\t\t\"expiration\": responseStep3.json[\u0027expiration\u0027]\n\t\t},\n\t\t\"MinutesToExpiration\": 55,\n\t\t\"DefaultPage\": None,\n\t\t\"MobileDefaultPage\": None\n\t\t};\n\t\u0027\u0027\u0027\n\tfor key in reportPost:\n\t\tif type(reportPost[key]) is dict:\n\t\t\tsystem.perspective.print(\"   \" + str(key) + \": \")\n\t\t\tfor item in reportPost[key]:\n\t\t\t\tsystem.perspective.print(\"      \" + str(item) + \": \" + str(reportPost[key][item]))\n\t\telse:\n\t\t\tsystem.perspective.print(\"   \" + str(key) + \": \" + str(reportPost[key]))\n\t\u0027\u0027\u0027\n\treturn reportPost",
      "type": "script"
    }
  ]
}
```

The binding uses several calls to the PowerBI REST API in order to get the embed configuration for the specific report. Since we are using the "App Owns Data" method, we need to have a Microsoft Entra Tenant that has access to the desired PowerBI Workspace.

# PowerBI Setup #
You need to create a Microsoft Entra (Azure) App following [this guide](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal) and **make sure to note down the client secret as you are making it, since it won't be able to be seen after initial creation**.
From the Microsoft Entra app, you will need to copy the **Application (Client) ID**, the **Directory (Tenant) ID**, and the **Client Secret** to the PowerBIReport component in Perspective.

You will need a PowerBI workspace that you want to keep the reports in that ignition will be able to access, and it must be under an account with a PowerBI Pro license. (As far as I know).
From this workspace, you will need the **Group (Workspace) ID** and the **Report ID**. both of these can be found in the url for a PowerBI Report.

For example, with the following url, the red underlined section is the Group (Workspace) ID and the green underlined section is the Report ID.

![image](https://github.com/user-attachments/assets/58066e38-c9ea-4d94-876c-c4bb1dd335c0)

# PowerBI Report Properties #
As of version 0.9.7 of the module, there are many new properties for interacting with the PowerBI report.
![image](https://github.com/user-attachments/assets/5a848aea-92da-471e-97ef-964a79000d89)

## tenantID, clientID, clientSecret, workspaceID, reportID ##
![image](https://github.com/user-attachments/assets/29f31a48-e2f8-48a1-a123-5143272af0ce)

These values are mostly described above, but changing them in the report properties doesn't automatically update the reportConfig. You will need to have a binding (an example listed above) to get that binding and keep it updated when it expires. You will need to create a Microsoft Entra (Azure) App to get the **clientID** (Application ID), **clientSecret**, and **tenantID** (Directory ID). Unless you have multiple apps, these three values will not change. A single Entra app can have access to many workspaces and the report within, so you should only need to set this up once (and then grant access to each workspace (or individual report) as you create them). The **workspaceID** and **reportID** will change based on which report you want to embed and which workspace it is located in, using the URL of the report, as described above.

## reportName
![image](https://github.com/user-attachments/assets/fe6db607-9049-44c6-9061-ed72837002b8)

This property is a placeholder where you can put the name of the report as it is returned from the PowerBI REST API call. This is not configured by default, but you can set this up as a binding.

## reportSettings ##
![image](https://github.com/user-attachments/assets/d279c993-9a99-4e95-99f1-98c73cc6afc2)

The settings for the report. You can set these before load and they will be applied to the report when it is embedded, or you can change them after embed and the report will automatically update the settings. Some settings such as **layoutType** will be set when changed, but the report won't change visually until it is reloaded (using the **reloadReport** toggle below or by refreshing the page). For more information on the available settings, see [the documentation](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/configure-report-settings). Some of the documentation refers to different settings with full names, but the underlying code really wants an integer, which you can find in the [powerbi-models documentation](https://learn.microsoft.com/en-us/javascript/api/powerbi/powerbi-models/). For example, **background** can be either default (0) or transparent (1).

## reportConfig ##
![image](https://github.com/user-attachments/assets/d2e99045-0826-4d81-9535-222ddd07ca79)

The actual report configuration settings needed by the module to embed the report. ** This is the most important property and the module will not work unless this is configured correctly.** You can use the example binding above to have the most basic version of this, but the **EmbedToken** will need to be updated before the **EmbedToken/expiration** time passes. If it is updated, the PowerBI report will pull in the new EmbedToken in the background without refreshing or reloading the report, making it seamless for your users. You might want to disable the automatic updating function until you have a capacity purchased, as a Pro license (including free accounts) have a limited number of EmbedTokens that they can generate before being locked out.

![image](https://github.com/user-attachments/assets/e8af774b-0d6d-4be8-af5a-0f1f968ac433)

For more information, see [the PowerBI Embedded FAQs](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embedded-faq).

## reloadReport ##
![image](https://github.com/user-attachments/assets/a3d12787-8f9c-44b4-8371-2381d304b180)

This property can be used as a momentary button to force the report to completely reload, either to test new **reportSettings** that don't auto apply, or due to the token expiring before the binding can get a new one, or due to errors. When the user sets this to True, it forces the whole report to reload, and the module will set it to False automatically.

## reportLoaded ##
![image](https://github.com/user-attachments/assets/754f772c-9828-45e8-8b74-fd3f63105bbc)

This property is automatically set by the module when the report fully renders. You can use this to fire a binding or trigger something else when the report is fully visible and interactable.

## filters ##
![image](https://github.com/user-attachments/assets/7f455a26-b992-4d29-917f-c5e50a64cb5d)

You can use the **reportFilters**, **pageFilters**, or **visualFilters** (with **targetVisual**) to filter aspects of the report. The desired filter array must be the only one with objects inside it, all others must be empty to apply the filters correctly. You can look at the [PowerBI Report Filters Documentation](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/control-report-filters) to see the format that filters need to be in, which will look something like this:

![image](https://github.com/user-attachments/assets/b727fed1-4545-4fd2-be67-6e7500e2a775)

The only property you shouldn't include is the $schema property from the documentation, that is automatically generated by the module, as long as the filter is one of the allowed types (listed below).

You can use any of the following **filterType** but not all have been tested with an actual report:
```
"advanced" (0),
"basic" (1),
"includeExclude" (3),
"relativeDate" (4),
"topN" (5),
"tuple" (6),
"relativeTime" (7),
"identity" (8),
"hierarchy" (9)
```

If you are applying Visual level filters, you need to have the **targetVisual** filled out with both the exact **name** and **type** of the visual you want to filter. If you are applying Report or Page level filters, you can leave this property blank. You can get the **targetVisual** type/name by using the **selectedData** property, described below.

When you are ready to apply filters, you can use the **applyFilters** toggle to apply them. If they are successful, in the console of the designer (or web browser) you will see "Replacing filters on (report/current page/visual type and name) with X new filters"
![image](https://github.com/user-attachments/assets/b4ad3540-bf42-4f21-b57a-36426caf73d9)

The **applyFilters** toggle will automatically set itself back to False when successful, but if there is an error, it will stay set to True.

For your convenience, you can use the **removeFilters** toggle to remove all filters without having to empty the array of filters that you have previously set. This will have a very similar output to the console, with "Removing all filters on (report/current page/visual type and name)" if it is successful, and then it will automatically set itself to False.

A good way to get the exact filter format and **targetVisual** is to use the **selectedData** property, described below.

## visualData ##
![image](https://github.com/user-attachments/assets/b797bfda-356f-4413-9f7b-07154326bdfe)

You can export data from a **targetVisual**, after you set the **type** (0 for Summarized (only the filtered data), 1 for Underlying (all data from the table connected to the visual)), and **limit** for the number of rows to return. When you select the **exportData** toggle, the module will return the number of rows of data you asked for (in a single CSV object with column headers) to the **data** property. You can use a script to format this data into whatever format you want to use within Ignition. You can get the **targetVisual** type/name by using the **selectedData** property, described below.

## selectedData ##
![image](https://github.com/user-attachments/assets/8d7e56c1-6d0b-4906-861e-d1eccc7ab8db)

When a datapoint is clicked on the report, the selected data is set to the **selectedData** property. It will tell you the report id and display name, the page name and display name, the visual name and type if a visual was clicked, and then the data will be returned in an array under **dataPoints**. If there are any filters applied to that visual, they will be shown in the **filters** array. 

When you click a visual not on a datapoint, it will clear the **selectedData** object.

You can use the **visual** name and type to format the **targetVisual** property on the **filters** or **visualData**, and the returned filters array when you click on data can be used to set up **visualFilters**.

## status ##
![image](https://github.com/user-attachments/assets/8a42c5ff-0217-40ec-a97f-f64526fa3cae)

Whenever the status of the embedded report changes, the **type** of change and **timestamp** on this property will update. 
The possible status types are:
* **loaded** - when the report configuration is accepted and the report is returned from PowerBI
* **rendered** - when the report has fully loaded visually and can be interacted with
* **dataSelected** - when a datapoint is selected from a visual
* **visualClicked** - when a visual is clicked but not on a datapoint

This changing timestamp and status can be used for your bindings or a change script can be added on the **status** object in order to trigger other events.


