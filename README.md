# PowerBI Module #
This module adds a component to Perspective that allows users to embed a PowerBI Report using the [App Owns Data](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/embedding-solutions) method to authorize the Ignition instance to control access to the report (and workspace) without requiring each user to log in to a PowerBI Pro account. You will need to set up a Microsoft Entra Tenant and follow all of the steps below in order to get the needed values for this module (Tenant ID, Client ID, Client Secret), and your PowerBI workspace and report will have the last two values (Workspace ID and Report ID) for fully embedding the desired report.

In order to use, install the signed (or unsigned) .modl file from [the build folder](build)

The module shows up under IA Systems Engineering (self-signed certificate)

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/61c4a40a-6c7d-4c81-9431-94ed7d4e385c)

In the designer, the PowerBI Report appears under the PowerBI Components header.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/36326e00-d959-44ef-8d0b-502c2c7f752b)

In order to embed a report, you need to provide the component with the reportConfig property which also requires your Tenant ID, Client ID, Client Secret. Workspace ID, and Report ID.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/7b7a0480-3ebe-4634-b8da-e93d34b4034d)

Most of the properties on the report (Tenant ID, Client ID, Client Secret, Workspace ID, and Report ID) are not directly linked to the report, and **must be used in a binding on the reportConfig property to fetch the report correctly**. That binding is reproduced below for convenience, or see how it is configured on the provided [test view](PowerBITestView) 
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

The binding uses several calls to the PowerBI Rest API in order to get the embed configuration for the specific report. Since we are using the "App Owns Data" method, we need to have a Microsoft Entra Tenant that has access to the desired PowerBI Workspace.

# PowerBI Setup #
You need to create a Microsoft Entra (Azure) App following [this guide](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal) and **make sure to note down the client secret as you are making it, since it won't be able to be seen after initial creation**.
From the Microsoft Entra app, you will need to copy the **Application (Client) ID**, the **Directory (Tenant) ID**, and the **Client Secret** to the PowerBIReport component in Perspective.

You will need a PowerBI workspace that you want to keep the reports in that ignition will be able to access, and it must be under an account with a PowerBI Pro license. (As far as I know).
From this workspace, you will need the **Group (Workspace) ID** and the **Report ID**. both of these can be found in the url for a PowerBI Report.

For example, with the following url, the red underlined section is the Group (Workspace) ID and the green underlined section is the Report ID.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/22b44c97-1848-4e44-953f-f37245b0b169)
