#!/usr/bin/env bash

set -euo pipefail

app_dir="/opt/DevOps-TaskFlow"

cd "$app_dir"

git fetch origin main

git reset --hard origin/main

cd backend

npm ci --omit=dev

sudo systemctl restart devops-taskflow.service

sleep 3

./../scripts/healthcheck.sh


