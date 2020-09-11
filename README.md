---
page_type: sample
languages:
- nodejs
- javascript
- tsql
- sql
products:
- azure
- vs-code
- azure-sql-database
- azure-functions
- azure-web-apps
description: "ToDo MVC Sample app Full Stack implementation using Azure Static WebApps, Azure Functions, Node, Vue.Js and Azure SQL (full JSON support)"
urlFragment: "azure-sql-db-todo-mvc"
---

<!-- 
Guidelines on README format: https://review.docs.microsoft.com/help/onboard/admin/samples/concepts/readme-template?branch=master

Guidance on onboarding samples to docs.microsoft.com/samples: https://review.docs.microsoft.com/help/onboard/admin/samples/process/onboarding?branch=master

Taxonomies for products and languages: https://review.docs.microsoft.com/new-hope/information-architecture/metadata/taxonomies?branch=master
-->

# ToDO MVC Sample App Full Stack Implementation

![License](https://img.shields.io/badge/license-MIT-green.svg)

Serverless Full Stack implementation on Azure of [ToDoMVC](http://todomvc.com/) app. 

## Azure Static WebApps, Azure Functions, Node and Azure SQL

The implementation uses

- [Azure Static WebApp](https://azure.microsoft.com/en-us/services/app-service/static/): to bind everything together in one easy package, natively integrated with GitHub CI/CD pipeline
- Vue.Js as front-end client
- Azure Function for providing serverless back-end infrastructure
- NodeJS for the back-end logic
- Azure SQL as database to store ToDo data

## Implementation Details

Folder structure

- `/api`: the NodeJs Azure Function code used to provide the backend API, called by the Vue.Js client
- `/client`: the Vue.Js client. Original source code has been taken from official Vue.js sample and adapted to call a REST client instead of using local storage in order to save and retrieve todos
- `/database`: the T-SQL script needed to setup the object in the Azure SQL database. Take a look at the Stored Procedure to see how you can handle JSON right on Azure SQL

## Setup Database

Execute the `/database/create.sql` script on a database of your choice. Could be a local SQL Server or an Azure SQL running in the cloud. Just make sure the desired database is reachable by your local machine (eg: firewall, authentication and so on), then use SQL Server Management Studio or Azure Data Studio to run the script. 

If you need any help in executing the SQL script on Azure SQL, you can find a Quickstart here: [Use Azure Data Studio to connect and query Azure SQL database](https://docs.microsoft.com/en-us/sql/azure-data-studio/quickstart-sql-database).

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

This is the amazing part of using Azure Static WebApps. Deploying to Azure is as easy as committing to GitHub.





