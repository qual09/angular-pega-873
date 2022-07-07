## Table of Contents
---

* [Introduction](#introduction)
* [Development environment](#development-environment)
* [Installation instructions](#installation-instructions)
* [Basic usage](#basic-usage)
* [Application configuration](#application-configuration)
* [Configure authentication](#configure-authentication)
* [Pega setup considerations](#pega-setup-considerations)
* [Creating a production build to deploy on an HTTP web server](#creating-a-production-build-to-deploy-on-an-http-web-server)
* [Application settings within the Settings dialog](#application-settings-within-the-settings-dialog)
* [Application structure](#application-structure)
* [PegaappNg](#pegaappng)
* [Code scaffolding](#code-scaffolding)
* [Perform unit tests](#perform-unit-tests)
* [Perform end to end tests](#perform-end-to-end-tests)
* [Other resources](#other-resources)
---

## Introduction

The Pega Angular Starter Pack provides sample code that illustrates leveraging Version 1 of the [Pega Digital Experience (DX) APIs](https://community.pega.com/digital-experience-api) to build a custom Angular front-end experience for Pega applications from which users can view, create, and update Pega cases and assignments.

It implements a simple case worker portal that works against most simple Pega applications.  It currently leverages [Angular Material UI](https://material.angular.io/) as its UI component library.

Install the Angular Starter Pack on your local desktop computer and configure the source code to access either a simple Pega application (or you can deploy and leverage the provided CableConnect or Repeat sample apps).

## Development environment

Node.js and NPM are critical for the installation and execution of the Pega Angular Starter Pack.  NVM is optional but recommended. For more information, see [Downloading and Installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

The application has been tested with:
* Node.js version: `16.14.0`.
* NPM version: `8.3.1`.

## Installation instructions

1. Download the latest [Pega Angular Starter Pack](https://community.pega.com/marketplace/components/angular-starter-pack) from Pega Marketplace.
2. Unzip the .zip file, it creates a folder or directory with the same name. This directory contains the following sub-directories:  
    * `CableConnectApp` - contains the zip file to import from Pega Dev Studio to install the CableConnect app.
    * `RepeatApp` - contains the zip file to import from Pega Dev Studio to install the RepeatApp app.
    * `Documents` - contains the instructions for installing the Pega CableConnect app.
    * `Angular App` - contains the source code you can use to build and execute the Pega Angular Starter Pack app.
3. Move `pega-angular.zip` from the `Angular App` directory into a directory of your choosing and unzip it. This creates a sub-directory called `pega-angular`.
4. Open a terminal or command prompt in the `pega-angular` directory and run the following command:  
    >`npm install` 
    
    The command retrieves all the dependent modules required by the Pega Angular Starter Pack application.
    
    **Important**: If the command execution encounters errors, it might be related to an incompatibility with the version of npm you are using and the package-lock.json file. Deleting the package-lock.json file and then running npm install again typically resolves this issue.
5. Configure the CableConnect Pega sample application by following the instructions within the `CableConnectSampleApp.pdf` file located within the Documents sub-directory.
6. Verify and ensure that your Pega application server and Pega application are set up properly. For more information, see [Pega Setup considerations](#pega-setup-considerations).
7. Review the Pega server connection information within the file `pega-angular/src/app/_services/endpoints.ts`.  See [Application Configuration](#application-configuration) section for more details on updating this to point to the Pega server which has been properly configured for DX API access.
8. Open a terminal or command prompt in the `Angular App` directory and run the following command:  
    >`npm start`
    
    The command opens your browser to http://localhost:4200 (OR to https://localhost:4200), which is where the application is served.  If you don't see the browser open automatically, look at the output from command and enter the provided URL into a browser.

## Basic usage

By default, the starter pack application is configured to access a local Pega server http://localhost:1080/prweb.
Use any of the following credentials to log into the CableConnect sample application:
* operator: `customer.cableco`, password: `pega` - case worker
* operator: `rep.cableco`, password: `pega` - case worker
* operator: `tech.cableco`, password: `pega` – case worker
* operator: `manager.cableco`, password: `pega` – case manager
* operator: `admin.cableco`, password: `pega` – developer/admin

For more information about [CableConnect](https://docs.pega.com/dx-starter-packs/cableconnect-sample-application), click the link. Once logged in, you can create cases from the CaseType list, open WorkObjects from the WorkList, and perform end-to-end flows, based on the data returned from the API.

**WARNING**: Operators in an imported application are disabled by default. You can enable them when you import the CableConnect sample application. To do so, select the **Enable advanced mode to provide more granular control over the import process** option in the second import screen.  This eventually provides a checkbox to enable the imported operators. For more information about importing CableConnect, see [Importing CableConnect](https://docs.pega.com/dx-starter-packs/importing-cableconnect). Also, the Pega server might be configured in a manner that you might need to change the operator passwords before using that operator. In a non-production Pega development server, one way to stop this forced password change from happening is by using DEV STUDIO and editing the **Platform Authentication** record located in `Records > SysAdmin > Authentication Service`. Within the **Security Policies** tab, the Password policy record may be removed. Remember to save the record after making such a change. Removing the security policy Pega Infinity from forcing a password change on the first login.


## Application configuration

The CableConnect application RAP includes an OAuth 2.0 client registration record named CableCoV1Oauth.  The endpoints.ts file is configured by default with the client ID associated with the CableCoV1Oauth OAuth 2.0 Client Configuration record located within the CableConnect sample application. For more information about using the sample application with OAuth, see the [Configure authentication](#configure-authentication) section.

To configure the application to access a different server follow these steps:

1. Open `pega-angular/src/app/_services/endpoints.ts` and modify the **`PEGAURL`** property to the value appropriate for your desired system.
2. If using a Pega server earlier than 8.5, set **use_v2apis** to _`false`_ to disable screen flow.
3. Set the authentication type. For more information, see the [Configure authentication](#configure-authentication) section.

**Important**: Ensure that your desired end-user operator access group includes the _`<AppName>:PegaAPI`_ role.

## Configure authentication

### Basic
To configure Basic authentication:
1. Open the **endpoints.ts** file using a text editor.
2. Set the **use_OAuth** field's value to _`false`_.
3. Save the file.
4. Log into Pega Platform.
5. Open Dev Studio and go to **`Dev Studio > Records > Integration-Resources > Service Package`**
6. Open the **api** record and select the _`Basic`_ option in the **Authentication type** field.
7. Save the record.
8. Open the **Application** record and select the _`Basic`_ option in the **Authentication type** field.
9. Save the record.

**Note**: Basic authentication is not compatible with Cosmos React applications.  We recommend that you use OAuth or disable screen flow capability.

### OAuth 2.0
To configure OAuth 2.0 authentication:
1. Open the **endpoints.ts** file using a text editor.
2. Set the **use_OAuth** field's value to _`true`_.
3. Enter the client ID from the OAuth 2.0 client registration record in the **client_id** field. Client ID for CableConnect is _`CableCov1OAuth`_. Create a new OAuth 2.0 client registration record if you do not want to use CableConnect's Client ID or have not imported CableConnect's client record data. For more information, see [Create OAuth 2.0 client registration record](#create-oauth-2.0-client-registration-record).
4. Set **loginExperience** to either _`loginBoxType.Main`_ or _`loginBoxType.Popup`_.
5. Save the file.
6. Log into Pega Platform.
7. Open Dev Studio and go to **`Dev Studio > Records > Integration-Resources > Service Package`**
8. Open the **api** record and select the _`OAuth 2.0`_ option in the **Authentication type** field.
9. Save the record.
10. Open the **Application** record and select the _`OAuth 2.0`_ option in the **Authentication type** field.
11. Save the record.

#### Create OAuth 2.0 client registration record
You can create a new OAuth 2.0 client registration record if you do not want to use the one included with the CableConnect sample application. For more information see [Creating and configuring an OAuth 2.0 client registration](https://docs.pega.com/security/87/creating-and-configuring-oauth-20-client-registration). 

Ensure the following client registration settings for the application:
* Type of client: Public.
* Grant type: Authorization code.
    * Add a redirect URI value based on the URL used to access the deployed Pega Angular Starter Pack Application (e.g., http://localhost:4200/auth). The URI must include the "auth" route in the path.
    * Create and configure additional redirect URIs if you want to have a local HTTP and HTTPS version of the app running as applicable. Add the extra redirect URIs to the list.
* Enable Proof Key for Code Exchange: Enabled.
* Set token lifetime limits. Pega servers earlier than 8.7 do not support the ability to refresh the token (for Public clients), so you must authenticate again after the interval ends.   

## Pega setup considerations

This section covers some important Pega application and Pega server setup or configuration requirements for using the starter pack properly in a particular Pega server.

* When you log in as a particular operator, the default application access-group specified for the operator is used.  This access group must contain the `PegaAPI` role to allow proper access to the Pega DX API.  (This is also mentioned within the CableConnect sample application documentation.)  Typically, the `<AppName>:PegaAPI` role is added to the application access group with `PegaRules:PegaAPI` specified as a dependent role.

* The Confirm harness/page has to be explicitly available within the application as the default one does not currently work with the DX API.

* The API Service Package record needs to have the proper authentication mechanism configured to permit proper access (either Basic or OAuth) and the Starter Pack app needs to be configured to match. See [Application Configuration](#application-configuration).

* Configure the Integration/Services/Endpoint-CORS policy mapping properly so that the "api/" endpoint is configured to utilize the **`APIHeadersAllowed`** CORS policy.

## Creating a production build to deploy on an HTTP web server

This section covers steps to build a production build and also outlines how to build it such that it may be deployed on some specific path within your hosting web server (e.g, /AngularApp).

Ensure the **endpoints.ts** file is setup and configured properly to reference your Pega server.

The npm run build command builds an optimized production build within the /pega-angular/dist/pegaapp-ng output directory. Use the **--configuration production** flag for a production build.

Run the following command to deploy an application to the desired **AngularApp** subdirectory:
  ```
  npm run build -- --configuration production --base-href /AngularApp/
  ```

If OAuth is configured, specify the full path to the application as an additional redirect URL within the OAuth 2.0 Client registration record used for the application. For example, if the app is deployed on a server named lab001.foo.com, then the redirect URI specified for an **AngularApp** chosen app name would be https://lab001.foo.com/AngularApp/auth.

The files within the pegaapp-ng directory may now be transferred to the appropriate web server path using sftp or alternate tooling used to transfer files to the web server.

To simplify deployment to any web server, the **postbuild** script in **package.json** creates directories correlating with the client-side routes supported by the application.  The script also supports copying the root **index.html** file to those directories.  An alternate (and more complex approach) is to not create the subdirectories which correlate to the client-side routes utilized and instead make web server-specific changes to serve up the root **index.html** page when unknown paths are encountered at the server.  For example, for Tomcat servers, the _Rewrite Valve_ may be enabled and an explicit rule specified for this app.  This would involve the following steps:

1. Enable _Rewrite Valve_ by adding the following XML within the **&lt;Host name="localhost"&gt;** XML element within the **conf/server.xml** config file:
```
<Valve className="org.apache.catalina.valves.rewrite.RewriteValve" />
```

2. Add , or if present, modify the **conf/Catalina/localhost/rewrite.config** file for this specific deployment:
```
RewriteCond %{REQUEST_PATH} !-f
RewriteRule ^/AngularApp/(.*) /AngularApp/index.html 
```
If employing such a web server based rules approach, the **postbuild** script may be eliminated within the **package.json** file.

Some deployment related references with info on other web servers:
* [Angular Guide: Deployment](https://angular.io/guide/deployment#server-configuration)
* [Deploying angular application on Tomcat Server--Fixing deep linking issue](https://medium.com/@nithin.biliya/deploying-angular-application-on-tomcat-server-fixing-deep-linking-issue-577565fe303d)

## Application settings within the Settings dialog

There are several settings presently within the Settings dialog which are present to illustrate alternate sequences of API usage:

  * `Page List/Group New Row`: Uses the _newRow_ object to insert or append a new row within repeating Page Groups and Page Lists.
  * `Page List/Group Use Page Instructions`: Generates pageInstructions content for all fields within repeating Page Groups and Page Lists.
  * `Embedded Page Use Page Instructions`: Generates pageInstructions content for all fields within Embedded Pages.
  * `Autocomplete/Dropdown use local options for Data Page`: When not selected, ignores the options that are populated within the field structure, and executes a separate GET /data/ endpoint transactions call to retrieve the options for the field.
  * `Autocomplete/Dropdown use local options for Clipboard`: When not selected, ignores the options that are populated within the field structure, and executes a separate GET /cases/{ID} call to retrieve the data from the appropriate "content" portion.
  * `Save assignment (preferred) (vs. Save Case)`: Invokes POST /assignments/{ID} instead of PUT /cases/{ID}. The POST assignments endpoint is available since Pega Infinity 8.4 and offers additional validation against the flow action properties.
  * `Screen flow`: Visible only if **useV2apis** is set to _`true`_ in the endpoints.ts file. Enables the application to display the Back button for multi-step form steps properly.
    * **Note**: With the CableCo sample app, the customer.cableco operator is the one which has a screen flow example.
     
## Application structure

The Angular application is structured as shown in the following block:

```
PegaApp/
  README.md
  e2e/
  node_modules/
  package.json
  src/
    app/
      _actions/
      _constants/
      _fieldcomponents
      _helpers/
      _messages/
      _pipe/
      _services/
      _subcomponents/
      casedetails/
      login/
      maintabs/
      navigation/
      workitem/
      worklist/
      worklistpanel
    assets/
    enviornments/
    index.html
```

Some of the most important directories and files are highlighted in the following sections:

### `_actions/`

This directory contains a handleaction.ts file, used to emit action events via Subject.

### `_constants`

Contains various constants related to Forms, Errors, and App.

### `_fieldcomponents`

This directory contains several files, each containing a component specific to a field type
such as Autocomplete, button, dropdown, etc.

### `_helpers/pageinstructions.ts`

Responsible for creating and updating Page Instructions as per the configurations which can be configured through 'settings modal'.

### `_helpers/ReferenceHelper.ts`

* Class to handle translating Pega's fully qualified property paths to a nested Object structure, and vice versa.
* Also some utility methods for:
  * Handling initial PegaForm state given View from API
  * Finding correct PageGroup/List based on property reference
  * Getting blank entry for PageGroup/List when adding a new element
* When posting data to the server via API, it must be nested.
* When retrieving field information from the server, the property paths are flat and qualified.

### `_services/`

Functions used to issue AJAX requests and manage responses.
All the included methods use the HTTP library for Observable based requests.

There are separate service files for:

* Assignments
* Cases
* Data Pages
* Users

### `workitem/workitem.component.ts`

This is an Angular component used to generate forms for assignments, views, and pages based on data returned from the Pega API.
Form generation for assignments, views, and pages is based on a nested UI data structure returned from the API.

* Views or pages contain groups.
* Each element of a Group array can contain a view, layout, field, paragraph, or caption.
* Layouts determine the UI structure of the form.
  * Supported layouts (layout.groupFormat values) are:
    * Dynamic (Simple layout)
    * Grid (Table)
    * Stacked
    * Inline middle
    * Inline grid double
    * Inline grid double (70 30)
    * Inline grid double (30 70)
    * Inline grid triple
  * Additional supported structural components:
    * Repeating (Dynamic) layout
    * Repeating (Grid) row
    * Embedded Section
  * Unsupported layouts and structural components include:
    * Layout group
    * Column layout
    * Dynamic layout group
    * Hierarchical table
    * Navigational tree
    * Dynamic container
    * AJAX container
    * Non-auto generated sections
    * Sections that include scripts
    * Non-guardrail-compliant sections
* Fields contain information about the property, including reference, current value, outstanding validation messages, and attached actions.
* Supported fields:
  * pxTextInput
  * pxDropdown
  * pxCheckbox
  * pxTextArea
  * pxURL
  * pxEmail
  * pxDateTime
  * pxInteger
  * pxNumber
  * pxPhone
  * pxDisplayText
  * pxHidden
  * pxButton
  * label
  * pxLink
  * pxIcon
  * pxRadioButtons
  * pxCurrency
  * pxAutoComplete
* Supported actions:
  * setValue
  * refresh
  * takeAction
  * runScript
  * openUrlInWindow
  * localAction (replaceCurrent and modalDialog)

PageGroups and PageLists are supported.

When doing a POST to submit an assignment or refresh fields, the "state" object is translated into a nested representation of the data based on page structure and sent to the server.

**Note**: When Page Instructions are enabled, fields within constructs that are represented by Page Instructions are sent within the pageInstructions as a sequence of directives to playback (rather than as specific values in the content).

## PegaappNg
This project has been generated using [Angular CLI](https://github.com/angular/angular-cli) version `12.2.15`.

## Code scaffolding

Run the following command to generate a new component:
  >`npm run ng generate component component-name` 

You can also use: 
  >`npm run ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Perform unit tests

Run the following command to execute the unit tests via [Karma](https://karma-runner.github.io):
  >`npm test` 

## Perform end to end tests

Run the following command to execute the end-to-end tests via [Protractor](http://www.protractortest.org/):
  >`npm run ng e2e`


---

## `Other resources`

* [Angular CLI Overview and Command Reference](https://angular.io/cli)
* [Material UI Angular](https://material.angular.io/)
* [Pega Digital Experience (DX) API Overview](https://docs.pega.com/pega-digital-experience-dx-api-overview/pega-digital-experience-dx-api-overview)
* [DX Starter Packs Documentation](https://docs.pega.com/dx-starter-packs/dx-starter-packs)
* [Supported Features within Starter Packs](https://docs.pega.com/dx-starter-packs/supported-features)
* [Troubleshooting the Starter Packs](https://docs.pega.com/dx-starter-packs/troubleshooting-starter-packs)
* [Layouts in DX API](https://docs.pega.com/user-experience/85/layouts-dx-api)
* [Pega API topic within Pega 8.5 Help File](https://community.pega.com/sites/default/files/help_v85/procomhelpmain.htm#pega_api/pega-api-sysmgmt-privileges-ref.htm)

