#!/usr/bin/env bash

set -euo pipefail

url="http://localhost:3000/health"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if  curl -fs "$url" >/dev/null ;then
	echo " $TIMESTAMP the app is ok " >>/var/log/devops-taskflow-health.log
	exit 0

else 
	echo " $TIMESTAMP the app did not respond " >>/var/log/devops-taskflow-health.log
	exit 1
fi



	
