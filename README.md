# PowerBI Module #
This module adds a component to Perspective that allows users to embed a PowerBI Report using the [App Owns Data](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/embedding-solutions) method to authorize the Ignition instance to control access to the report (and workspace) without requiring each user to log in to a PowerBI Pro account.

In order to use, install the signed (or unsigned) .modl file from [the build folder](build)

The module shows up under IA Systems Engineering (self-signed certificate)

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/61c4a40a-6c7d-4c81-9431-94ed7d4e385c)

In the designer, the PowerBI Report appears under the PowerBI Components header.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/36326e00-d959-44ef-8d0b-502c2c7f752b)

In order to embed a report, you need to provide the component with the reportConfig property which also requires your Tenant ID, Client ID, Client Secret. Workspace ID, and Report ID.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/7b7a0480-3ebe-4634-b8da-e93d34b4034d)

The reportConfig property is currently not implemented as part of the module (but is planned to be implemented). Currently the easiest way to get that reportConfig is to use the binding on the provided [test view](PowerBITestView) 

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

The binding uses several calls to the PowerBI Rest API in order to get the embed configuration for the specific report. Since we are using the "App Owns Data" method, we need to have a Microsoft Entra Tenant that has access to the desired PowerBI Workspace.

# PowerBI Setup #
You need to create a Microsoft Entra (Azure) App following [this guide](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal) and **make sure to note down the client secret as you are making it, since it won't be able to be seen after initial creation**.
From the Microsoft Entra app, you will need to copy the **Application (Client) ID**, the **Directory (Tenant) ID**, and the **Client Secret** to the PowerBIReport component in Perspective.

You will need a PowerBI workspace that you want to keep the reports in that ignition will be able to access, and it must be under an account with a PowerBI Pro license. (As far as I know).
From this workspace, you will need the **Group (Workspace) ID** and the **Report ID**. both of these can be found in the url for a PowerBI Report.

For example, with the following url, the red underlined section is the Group (Workspace) ID and the green underlined section is the Report ID.

![image](https://github.com/inductive-automation/powerbi-module/assets/152290956/22b44c97-1848-4e44-953f-f37245b0b169)

## Build Requirements ##
### The rest of this README is from the example Perspective-Components Module ###

There are two different ways to build these component resources.  The easiest is to simply allow Gradle to handle the build by
running `./gradlew :web:build` (macOs/linux) or `gradlew.bat :web:build` (windows) from the root of the project.  Doing this will
download Node, Npm, Yarn, with versions set to those specified in the `web/build.gradle` configuration file.

It will then execute the typescript compilation using these downloaded binaries.

Alternatively, the packages can be built at the commandline, but require locally (user) installed versions of the
following dependencies:

* Node JS
* Npm (the Node Package Manager)
* Typescript
* Webpack
* Lerna
* Yarn

Versions of these dependencies are defined in the `package.json` files found in the web/ directory, generally as  _devDependencies_ section.  The root package.json defines shared dev dependency configurations used by the subprojects in 'web/packages/'

The suggested install route for these is to install the latest LTS version of NPM (which will also install Node) as per
the typical npm install route, and then use npm itself to install the other dependencies.

With NPM installed, the following command will install the remaining dependents (should not require sudo/admin privs to
succeed):

`npm i -g typescript tslint webpack lerna`

Building using these locally installed tools is described below in the 'Usage' section.

## How the Web Package are Included in the Module ##

The web files we create (js/css/etc) need to be resolvable as _resources_ by the Java Classloader.
Prior to updating the module plugin to the new open-source version (`io.ia.sdk.modl`), we used a simple copy mechanism
to get our js and css files into the _gateway_ scoped classpath.  In doing so, we simply copied the files into the
gateway folder's _src/main/resources/mounted/_ folder.  This is a functional solution, but is not a great practice for
a number of reasons: the risk of ending up with multiple/stale copies in your resource folder, the need to .gitignore,
and the inability to properly support Gradle's [incremental assembly](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:up_to_date_checks)
(the gateway jar needs to get rebuilt if our web assets change, because its resources have changed), and more.

In this current project, the _web_ project itself is built into a jar file (artifact) whose contents are simply the web
resources. This _web_ artifact is a dependency of the _gateway_ subproject, which gives the gateway classloader the
same ability to resolve the resources (js/css files), without needing to mutate the gateway jar at all.


### About These Dependencies ###

Briefly - these tools serve the following purposes:

* *Lerna* - used to orchestrate the building of multiple inter-dependent node packages
* *Yarn* - used as a dependency manager, replacing `npm` as the package manager in the context of the `web/` packages being
built.
* *Webpack* - a 'bundler', which is ultimately a build tool that combines or _bundles_ the necessary files/source into something
that may be used as a `<script>` file on a web page.  Through plugins/configuration, it can strip excess/unused/unreachable
code, minify, uglify, create source maps for browser-enabled debugging, etc.  The configuration provided in this example
is a bare-minimum 'simple use' case which includes the use of the _Typescript Loader_ to manager the typescript
compilation prior to bundling.
* *Typescript* - A superset of Javascript, which allows for strong typing, fuller OOP support.  Ultimately compiles
 (sometimes called _transpiles_ ) to javascript.  Javascript version compatibility depends on configuration of
 `tsconfig.json`, and webpack.


## Directory Structure Information ##

Perspective has different 'scopes', much like Vision.  The 'client' scope refers to a perspective project running in a
web browser.  The 'designer' scope refers to a perspective project executing in the Ignition Designer's Perspective View
Workspace (perspective resource editor).  Similar to the OOP principles used in Vision, perspective's designer scope
builds on top of the client scope, adding designer-specific functionality.

These scopes are distinct in that the designer may have UI/runtime elements that are not present in the client, such as design-specific layout guides/ui,'rulers', and 'interaction delegates' implemented by advanced components and containers in order to provide additional functionality in the designer.

As a result, we have two different folders under the 'packages' directory - one for client which is loaded when a
project loads and executes once published.  The other for the designer, which depends on and may extend the client
scoped components, and exists only within the designer.

Using Lerna and Yarn allows us to resolve these dependencies locally, and allows for a more sane development experience.

Each subpackage withing `packages` has a number of files.  Here is a brief description of the file and what it does:

* *.npmrc* - Contains configuration used by npm (as well as in our case - yarn), to determine where it resolves
packages.  Notably, this is required to tell our dependency manager that dependencies containing the
`@inductiveautomation` scope prefix should resolve against the Inductive Automation node package repository, similar to
 how we provide maven artifacts.
 * *webpack.config.js* - configuration file used for webpack, bearing the default webpack name.
 * *package.json* - Where package names, versions, and dependencies are defined, including dev dependencies.  May
 optionally contain configuration for additional tools.
 * *tsconfig.json* - Contains configuration specific to the typescript compiler as well as (optionally) configuration
 for typescript related build plugins/tools
 * *yarn.lock* - a dependency 'lock file' - which is used to 'lock' the dependency structure into specific versions and
 a statically-defined dependency graph.  By default, npm packages don't have this consistency.  This file should be
 committed and saved any time a dependency is changed/added.
 * *typescript/* - folder containing all the typescript source files.  The root `<scopename>.ts` is the 'index' or
 'entry' point of the package.  All components intended to be usable at runtime must be exported from this root index,
 otherwise it may get 'pruned' from the final javascript file.
 * *dist/* - the `distribution` or `build output` directory.  It's created and populated with the result of your
 typescript --> webpack bundling.  May be safely deleted, will be recreated on next build.

## Usage ##

If not using the gradle build (which is likely overkill if only seeking to rebuild the typescript packages), you can use
the following procedure to install dependencies and compile the files.

1. Execute `yarn` through the commandline in the `./web/` directory.  This will download and install node dependencies,
described in the package.jsons of all packages, including the perspective-client and perspective-designer dependencies.
This command only needs to be run one time initially, and then once follow any changes to dependencies in package.json,
or if node_modules folders (the local dependency cache folder) are deleted.  It only needs to be run once, in the root
of the `web` folder, and will establish the dependencies for child packages.

2. Execute `lerna run build` - which will execute the build scripts for each child package.

## Notes ##

* Typescript, webpack, etc, is not required to build a module with components for Perspective. We recommend it as best
practice, but you are free to create your javascript any way you would prefer.
* dist/ contains the final output of a build
* The webpack build finalizes with the copying of the webpacked resources from each packages `dist/` folder into the
gateway scoped `resources/mounted/js/` folder, which is where perspective will look to retrieve them.  This location is
registered as part of the GatewayHook.


## Terms ##

`package` - in NPM/Node parlance, a 'package' is a dependency that may be used by other packages, either as a global name on the page, or as a Universal Module (UMD).
