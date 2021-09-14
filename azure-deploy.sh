#!/bin/bash
set -euo pipefail

# Load values from .env file or create it if it doesn't exists
FILE=".env"
if [[ -f $FILE ]]; then
	echo "Loading from .env" 
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

echo "Creating Resource Group...";
az group create \
    -n $resourceGroup \
    -l $location

echo "Deploying Static Web App...";
az staticwebapp create \
    -n $appName \
    -g $resourceGroup \
    -s $gitSource \
    -l $location \
    -b main \
    --api-location "./api" \
    --app-location "./client" \
    --output-location "" \
    --token $gitToken 

echo "Done."