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

## Running local

Details on how to run Azure Static WebApps locally can be found here:

[Set up local development for Azure Static Web Apps Preview](https://docs.microsoft.com/en-us/azure/static-web-apps/local-development)



## Running on Azure

TDB





