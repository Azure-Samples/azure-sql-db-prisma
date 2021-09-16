#!/bin/bash
set -euo pipefail

# Load values from .env file or create it if it doesn't exists
FILE=".env"
if [[ -f $FILE ]]; then
	echo "Loading from $FILE" 
    export $(egrep . $FILE | xargs -n1)
else
	cat << EOF > .env
resourceGroup=""
appName=""
location=""

# Change this if you are using your own github repository
gitSource="https://github.com/Azure-Samples/azure-sql-db-prisma.git"
gitToken=""
EOF
	echo "Enviroment file not detected."
	echo "Please configure values for your environment in the created .env file"
	echo "and run the script again."
	exit 1
fi

FILE="./api/.env"
echo "Loading from $FILE" 
export $(egrep . $FILE | xargs -n1)

echo "Creating Resource Group...";
az group create \
    -n $resourceGroup \
    -l $location

echo "Deploying Static Web App...";
az deployment group create \
  --name ToDoMVC-SWA \
  --resource-group $resourceGroup \
  --template-file azure-deploy.arm.json \
  --parameters \
    name=$appName \
    location=$location \
    repositoryToken=$gitToken \
    repositoryUrl=$gitSource \
    branch=main \
    appLocation="./client" \
    apiLocation="./api" \
    azureSQL=$DATABASE_URL 

echo "Getting Static Web App...";
dhn=`az staticwebapp show -g $resourceGroup -n $appName --query "defaultHostname"`
echo "Static Web App created at: $dhn";

echo "Done."