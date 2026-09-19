#!/usr/bin/env bash

set -euo pipefail

echo " starting Installing Node.js and PostgreSQL..."

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs postgresql

cd /opt/DevOps-TaskFlow/backend

echo " copy backend/.env.example to backend/.env "

npm ci --omit=dev

