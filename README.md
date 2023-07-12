# .NET Blazor WebAssembly with KoliBri

## Requirements

- Node.js (https://nodejs.org/de/download)
- .NET SDK 6 or above (https://dotnet.microsoft.com/en-us/download/visual-studio-sdks)

## Execute

To run the example app you only need to start the project using dotnet: `dotnet run .` 
If you want to watch for changes start the project using `dotnet watch --project . --verbose`.

Finally the app is hosted on `https://localhost:7201` and `http://localhost:5171`.

## New project

The following steps describe how to create a new Blazor project integrating KoliBri as the preferred component library.

### Create the project

Create a new Blazor project using these CLI commands: `dotnet new blazorwasm -n <ProjectName>` or create the project with Visual Studio.

### Import KoliBri via NPM

To use the NPM packages of KoliBri and others, it is necessary to create a NPM project where the NPM packages can be imported. It is possible to import it by building with Webpack and including the bundled JS file.

The following steps are completely for CLI commands, e.g., with PowerShell.

#### Initialize NPM project

1. Create a new folder for a NPM project: `mkdir NpmJS`
2. Enter the folder: `cd NpmJS`
3. Create NPM project: `npm init -y`

#### Install and import KoliBri

Install KoliBri and the themes package: `npm install @public-ui/components @public-ui/themes`. When it is done, create a `index.js` file in the `src` folder that calls the register function of KoliBri and finally starts Blazor:

```js
import { register } from "@public-ui/components";
import { defineCustomElements } from "@public-ui/components/dist/loader";
import { BMF } from "@public-ui/themes";

register(BMF, defineCustomElements).then(() => {
  if (Blazor) {
    Blazor.start();
  } else {
    console.warn("Unable to start Blazor. Is it not initialized?");
  }
});
```

#### Build NPM project

The build and bundle of the project can be done with Webpack.

Install Webpack as a dev dependency: `npm install webpack webpack-cli --save-dev`. Create a `webpack.config.js` file in the root of the NPM project to configure Webpack. Set the `src/index.js` file as the entry and the output location in the `wwwroot` folder of the Blazor project.

The configuration file (`webpack.config.js`) should look like this:

```js
const path = require("path");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "..", "wwwroot", "js"),
    filename: "index.bundle.js",
  },
};
```

Then open the `package.json` file and create a new script that builds the project and copies the bundled code file to the public folder (`wwwroot`) of the Blazor project. Webpack is using the configuration file created before:

```json
{
  "scripts": {
    "build": "webpack"
  }
}
```

Finally import KoliBri in the `index.html` file and disable Blazors autostart. Remember: the Blazor start function is called after KoliBri has been registered.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>

  <body>
    <script src="_framework/blazor.webassembly.js" autostart="false"></script>
    <script src="js/index.bundle.js"></script>

    <div id="app">Loading...</div>
    <div id="blazor-error-ui">
      An unhandled error has occurred.
      <a href="" class="reload">Reload</a>
      <a class="dismiss">🗙</a>
    </div>
  </body>
</html>
```

#### Assets

Some themes of KoliBri use their own fonts and icon sets. To make them available, it is necessary to copy them to the `wwwroot` folder.

Install `cpy-cli` and `npm-run-all` as dev dependencies by using the command `npm i -D cpy-cli npm-run-all` and add some new scripts to the `package.json` file to copy them to the `assets` folder:

```json
{
  "scripts": {
    "build": "webpack",
    "postinstall": "npm-run-all postinstall:*",
    "postinstall:components-assets": "cpy \"node_modules/@public-ui/components/assets/**/*\" ../wwwroot/assets --dot",
    "postinstall:themes-assets": "cpy \"node_modules/@public-ui/themes/assets/**/*\" ../wwwroot/assets --dot"
  }
}
```

Import the assets in the head part of the `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="/assets/bundes/style.css" />
    <link rel="stylesheet" href="/assets/fontawesome-free/css/all.min.css" />
  </head>
  ...
</html>
```

### Using the components

Now it is possible to use the KoliBri components as web components. For example, you can adapt the welcome page using the KoliBri components.

```html
@page "/"

<PageTitle>Index</PageTitle>

<kol-heading _level="1" _label="Hello, world!"></kol-heading>

Welcome to your new app with KoliBri.

<kol-alert
  _heading="How is Blazor working for you?"
  _level="2"
  _type="info"
  _variant="msg"
  >Please take our
  <a
    target="_blank"
    class="font-weight-bold link-dark"
    href="https://go.microsoft.com/fwlink/?linkid=2148851"
    >brief survey</a
  >
  and tell us what you think.</kol-alert
>
```

## Developer Experience

These chapter contains some tips for better and faster development.

### Auto install and build

To automatically install and build the NPM project before launching the Blazor project, it is possible to call the steps automatically before building the Blazor project by extending the `csproj` file:

```html
<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">
  ...
  <Target Name="PreBuild" BeforeTargets="PreBuildEvent">
    <Exec Command="npm install" WorkingDirectory="NpmJS" />
    <Exec Command="npm run build" WorkingDirectory="NpmJS" />
  </Target>
</Project>
```

This is not recommended during continuous development because the npm install and build steps would be called before each rebuild.

### Source control

Ignore files and folders that are generated or installed from an external source. The `.gitignore` file should contain these rules:

```sh
# NET folders
bin
obj

# VS Code
.vscode

# NPM
NpmJS/node_modules

# Generated
wwwroot/assets
wwwroot/js/*index.bundle.js*
```

### Debugging

For a better development experience, this launch configuration for VS Code starts the project at `https://localhost:7021` and watches for file changes.

Add this configuration to the `launch.json` file in the `.vscode` folder at the root of the project.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch and Debug Standalone Blazor WebAssembly App",
      "type": "blazorwasm",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "url": "https://localhost:7021" // Tell launch where to find site
    },
    {
      "name": "Watch",
      "type": "coreclr",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "program": "dotnet",
      "args": [
        "watch",
        "--project",
        ".",
        "--verbose" // Let's us confirm browser connects with hot reload capabilities
      ],
      "preLaunchTask": "build" // Ensure we don't watch an unbuilt site
    },
    {
      "name": "Attach",
      "type": "blazorwasm",
      "request": "attach",
      "cwd": "${workspaceFolder}",
      "url": "https://localhost:7021", // Tell launch where to find site
      "timeout": 300000 // Allows time for the site to launch
    }
  ],
  "compounds": [
    {
      "name": "Debug with Hot Reload",
      "configurations": ["Watch", "Attach"]
    }
  ]
}
```

## Sources

- https://brianlagunas.com/using-npm-packages-in-blazor/
- https://dev.to/sacantrell/vs-code-and-blazor-wasm-debug-with-hot-reload-5317
