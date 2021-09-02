---
page_type: sample
languages:
- nodejs
- typescript
- sql
products:
- azure
- vs-code
- azure-sql-database
- azure-functions
- azure-web-apps
description: "TodoMVC Sample app Full Stack implementation using Prisma, Azure Static WebApps, Azure Functions, TypeScript, Nodejs, Vue.Js and Azure SQL (full JSON support)"
urlFragment: "azure-sql-db-todo-mvc"
---

<!-- 
Guidelines on README format: https://review.docs.microsoft.com/help/onboard/admin/samples/concepts/readme-template?branch=master

Guidance on onboarding samples to docs.microsoft.com/samples: https://review.docs.microsoft.com/help/onboard/admin/samples/process/onboarding?branch=master

Taxonomies for products and languages: https://review.docs.microsoft.com/new-hope/information-architecture/metadata/taxonomies?branch=master
-->

# TodoMVC Sample App Full Stack Implementation

![License](https://img.shields.io/badge/license-MIT-green.svg)

Serverless Full Stack implementation on Azure of [ToDoMVC](http://todomvc.com/) app. 

## Azure Static WebApps, Azure Functions, Node and Azure SQL

The implementation uses

- [Azure Static WebApp](https://azure.microsoft.com/en-us/services/app-service/static/): to bind everything together in one easy package, natively integrated with GitHub CI/CD pipeline
- [Vue.Js](https://vuejs.org/) as front-end client
- [Azure Function](https://azure.microsoft.com/en-us/services/functions/) for providing serverless back-end infrastructure
- [Prisma](https://www.prisma.io/) to interact with the Azure SQL database
- [TypeScript](https://www.typescriptlang.org/) for the back-end logic
- [NodeJS](https://nodejs.org/en/) for the back-end logic
- [Azure SQL](https://azure.microsoft.com/en-us/services/sql-database/) as database to store ToDo data
- [GitHub Actions](https://github.com/features/actions) to Deploy the full-stack website (thanks to Azure Static WebApps)

## Implementation Details

Folder structure

- `/api`: the NodeJs Azure Function code used to provide the backend API, called by the Vue.Js client
- `/client`: the Vue.Js client. Original source code has been taken from official Vue.js sample and adapted to call a REST client instead of using local storage in order to save and retrieve todos
- `/database`: the T-SQL script needed to setup the object in the Azure SQL database. Take a look at the Stored Procedure to see how you can handle JSON right on Azure SQL

More details are available in this blog post: [TodoMVC Full Stack with Azure Static Web Apps, Node and Azure SQL](https://devblogs.microsoft.com/azure-sql/todomvc-full-stack-with-azure-static-web-apps-node-and-azure-sql/)

## Setup Database

Create a `.env` file by copying [.env.template](./api/.env.template) inside the [./api](./api) folder. 

Define the database URL using the following format:
```
DATABASE_URL="sqlserver://DB_SERVER_NAME.database.windows.net:1433;database=DB_NAME;user=DB_USER@DB_SERVER_NAME;password={PASSWORD};encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30"
```

The server could be a local SQL Server or an Azure SQL running in the cloud. Just make sure the desired database is reachable by your local machine (eg: firewall, authentication and so on).

To create the database schema, run the following command:
```
npx prisma migrate deploy
```

> **Note:** `prisma migrate deploy` will run the migration in the repository. To automatically create SQL migrations based on changes in your Prisma schema and run them use the `prisma migrate dev` command. If you're using Azure SQL and the `prisma migrate dev` command, you will need to also set the URL of the [shadow database](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#cloud-hosted-shadow-databases-must-be-created-manually) for development purposes.


Of course if you want to deploy the solution on Azure, use Azure SQL.

To learn more about [Prisma Migrate](https://www.prisma.io/migrate), check out the [Prisma Migrate docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)

If you need to create an Azure SQL database from scratch, an Azure SQL S0 database would be more than fine to run the tests.

```
az sql db create -g <resource-group> -s <server-name> -n resiliency_test --service-objective S0
```

Remember that if you don't have Linux environment where you can run [AZ CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) you can always use the [Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart). If you prefer to do everything via the portal, here's a tutorial: [Create an Azure SQL Database single database](https://docs.microsoft.com/en-us/azure/azure-sql/database/single-database-create-quickstart?tabs=azure-portal).

If you are completely new to Azure SQL, no worries! Here's a full playlist that will help you: [Azure SQL for beginners](https://www.youtube.com/playlist?list=PLlrxD0HtieHi5c9-i_Dnxw9vxBY-TqaeN).


## Running local

Now use the `/api/.env.template` file to create an `.env` file and add the correct information needed to access your SQL Server or Azure SQL.

Details on how to run Azure Static WebApps locally can be found here:

[Set up local development for Azure Static Web Apps Preview](https://docs.microsoft.com/en-us/azure/static-web-apps/local-development)

Long story short (make sure you have installed all the prerequisites mentioned in the link above):
- Run Azure Function from within Visual Studio Code (just hit F5 on the `/api` folder)
- Serve `/client/index.html` using Visual Studio Code Live Server

## Running on Azure

This is the amazing part of using Azure Static WebApps. Deploying to Azure is completely automated via GitHub actions.

1. Fork this repository 
1. Open the Azure Portal
1. Create a "Static Web App" resource and follow the instruction here: [Building your first static web app in the Azure portal](https://docs.microsoft.com/en-us/azure/static-web-apps/get-started-portal?tabs=vanilla-javascript), but:  
   - When asked for GitHub repo details, point to the forked repo you just created
   - Select "main" as branch
   - Select "Custom" in the "Build Presets" dropdown
   - Set `client` as "App location"
1. Wait for resource creation and GitHub action completion. Once the resource is ready, click on "Go to Resource".
1. Be patient, now GitHub Action will kick in and deploy the full-stack website. It will take a couple of minutes.
1. Relax.
1. Grab some coffee or tea.
1. Drink it.
1. Click on "Functions" and you should be able to see the `todo` function listed.
1. Go to the "Configuration" tab and add the same key and values that you have in your `.env` file you created earlier for local execution.
1. Go to "Overview" and click on "Browse" to open your website. Done!

### Azure Static Web App Preview 

Azure Static Web App are in Preview and at the moment only support a Free tier...which is absolutely great so that you can try them for free, but of course don't expect great performances. REST API response will be in the 500 msec area. Keep this in mind if you are planning to use them for something different than testing. If you need better performance right now and cannot when for when Azure Static Web App will be out of preview, you can always deploy the REST API using plain Azure Functions where you can have amazing scalability and performance.
