# Phase 2 — Bash Scripting

## 🎯 Goal

The goal of Phase 2 was to use Bash scripting to automate repetitive operational tasks.

Instead of manually performing the same commands every time, the project now has scripts for:

* Preparing a new server environment
* Deploying new application code
* Checking application health
* Backing up the PostgreSQL database

This phase introduced Bash as the automation layer connecting Linux administration with the application.

---

# 1. What I Learned

During this phase I practiced:

* Bash variables
* Command substitution
* Conditional statements
* Exit codes
* Script arguments
* Functions
* Loops
* Environment variables
* `source`
* `export`
* Output redirection
* `set -euo pipefail`
* Cron jobs
* Using Bash scripts with systemd and PostgreSQL

The main focus was not only writing the commands, but understanding why each command is needed in a real server environment.

---

# 2. Scripts

The project contains four Bash scripts:

```text
scripts/
├── setup.sh
├── deploy.sh
├── healthcheck.sh
└── backup.sh
```

Each script has a different responsibility.

---

# 3. setup.sh

## Purpose

`setup.sh` prepares a new Ubuntu server for running the application.

Current script:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "[setup] Installing Node.js and PostgreSQL..."

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs postgresql

cd /opt/DevOps-TaskFlow/backend

npm ci --omit=dev

echo "[setup] Done. Copy backend/.env.example to backend/.env before starting."
```

## What it does

### 1. Enables safer Bash behavior

```bash
set -euo pipefail
```

This makes the script stop when a command fails, catches unset variables, and handles failures in pipelines more safely.

### 2. Installs Node.js

The NodeSource setup script is used to configure the Node.js repository before installing Node.js.

The project requires:

```text
Node.js >= 20
```

The current VM already had Node.js 22 installed, which also satisfies the project's requirement.

### 3. Installs PostgreSQL

```bash
sudo apt install -y postgresql
```

The `-y` option automatically confirms the installation.

### 4. Installs production dependencies

```bash
npm ci --omit=dev
```

`npm ci` performs a clean and reproducible dependency installation using `package-lock.json`.

`--omit=dev` excludes development dependencies because this script is intended to prepare an environment for running the application.

Importantly, `npm ci` only installs dependencies. It does not start the application. The application is managed by systemd.

---

# 4. deploy.sh

## Purpose

`deploy.sh` automates deployment of the latest application code.

The deployment flow is:

```text
Remote Git Repository
        ↓
git fetch
        ↓
git reset --hard origin/main
        ↓
npm ci
        ↓
restart systemd service
        ↓
health check
```

Current script:

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/devops-nodejs-app"

cd "$APP_DIR"

git fetch origin main
git reset --hard origin/main

cd backend && npm ci --omit=dev

sudo systemctl restart devops-nodejs-app

sleep 3

./../scripts/healthcheck.sh
```

## Important commands

### `git fetch origin main`

Downloads the latest information from the remote `main` branch.

It does not directly modify the working files.

### `git reset --hard origin/main`

Makes the deployment server match the remote `main` branch.

This is intentional for a deployment server where local manual code changes should not be preserved.

### `npm ci --omit=dev`

Installs the production dependencies after the new code is downloaded.

### `systemctl restart`

Restarts the application service so the running Node.js process uses the newly deployed code.

### `sleep 3`

Allows a short amount of time for the application to start before the health check runs.

### Health check

The deployment script runs `healthcheck.sh` after restarting the service.

This is important because a successful `systemctl restart` does not necessarily mean that the application is responding correctly.

---

# 5. healthcheck.sh

## Purpose

The health check verifies that the Node.js application is responding through its `/health` endpoint.

Current script:

```bash
#!/usr/bin/env bash
set -euo pipefail

URL="http://localhost:3000/health"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if curl -sf "$URL" > /dev/null; then
    echo "[$TIMESTAMP] OK - app is healthy" >> /var/log/devops-nodejs-app-health.log
    exit 0
else
    echo "[$TIMESTAMP] FAIL - app did not respond" >> /var/log/devops-nodejs-app-health.log
    exit 1
fi
```

## How it works

### URL

```bash
URL="http://localhost:3000/health"
```

This is the application's health endpoint.

### Timestamp

```bash
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
```

Command substitution runs `date` and stores the result in the variable.

Example:

```text
2026-09-19 19:30:00
```

### curl

```bash
curl -sf "$URL"
```

* `-s` = silent output
* `-f` = fail when the HTTP request returns an error status

The response body is discarded:

```bash
> /dev/null
```

The script only cares whether the request succeeded.

### Exit codes

If the health check succeeds:

```bash
exit 0
```

If it fails:

```bash
exit 1
```

This allows other tools such as deployment scripts or cron jobs to detect failure.

---

# 6. Cron

The health check was scheduled to run automatically every five minutes.

The user's crontab contains:

```cron
*/5 * * * * /opt/DevOps-TaskFlow/scripts/healthcheck.sh
```

## Meaning

```text
*/5   → every 5 minutes
*     → every hour
*     → every day of the month
*     → every month
*     → every day of the week
```

Therefore the health check runs approximately:

```text
12:00
12:05
12:10
12:15
...
```

The script itself does not contain a loop. **Cron is responsible for running it repeatedly.**

The cron job is configured for the `devops` user rather than using `sudo crontab`, so the health check runs under the normal deployment user.

---

# 7. backup.sh

## Purpose

`backup.sh` creates a timestamped backup of the PostgreSQL database.

Current flow:

```text
PostgreSQL Database
        ↓
     pg_dump
        ↓
     SQL file
        ↓
/opt/backups/
```

The important command is:

```bash
PGPASSWORD="$PGPASSWORD" pg_dump -h "$PGHOST" -U "$PGUSER" "$PGDATABASE" \
  > "$BACKUP_DIR/devopsapp_$TIMESTAMP.sql"
```

## PostgreSQL environment variables

The script requires:

```text
PGHOST
PGUSER
PGPASSWORD
PGDATABASE
```

These values are stored in the application's `.env` file.

A Bash script does not automatically read `.env`. Unlike the Node.js application, Bash does not use the `dotenv` package.

Therefore the script explicitly loads the `.env` file:

```bash
set -a
source "$(dirname "$0")/../backend/.env"
set +a
```

### `set -a`

Enables automatic exporting of variables created while loading the `.env` file.

### `source`

Reads the `.env` file into the current Bash shell.

### `set +a`

Turns automatic exporting off again after the `.env` file has been loaded.

This makes the variables available to external commands such as `pg_dump`.

---

# 8. Backup Filename

The script creates a timestamp:

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
```

For example:

```text
20260919_165606
```

The backup is therefore saved as:

```text
/opt/backups/devopsapp_20260919_165606.sql
```

This prevents different backups from overwriting each other.

---

# 9. Testing the Backup

The script was successfully executed:

```bash
sudo ./backup.sh
```

The result was:

```text
Backup saved to /opt/backups/devopsapp_20260919_165606.sql
```

This confirmed that:

* PostgreSQL connection information was loaded successfully.
* `pg_dump` was able to connect to the database.
* The database dump was generated.
* The SQL backup file was created successfully.

The backup can be checked with:

```bash
sudo ls -lh /opt/backups/
```

---

# 10. Restore Concept

A backup is useful because it can later be restored.

The basic relationship is:

```text
Backup:

PostgreSQL
    ↓
pg_dump
    ↓
backup.sql
```

Restore:

```text
backup.sql
    ↓
psql
    ↓
PostgreSQL
```

A restore can be performed with `psql` against the appropriate database.

The backup should not be restored over the current production database just for testing. A separate test database should be used for a real restore test.

---

# 11. Problems Encountered

## Problem 1 — `.env` was not automatically available to Bash

The first version of `backup.sh` assumed these variables already existed:

```text
PGHOST
PGUSER
PGPASSWORD
PGDATABASE
```

However, they were actually stored in:

```text
backend/.env
```

The Node.js application reads `.env` through `dotenv`, but Bash scripts do not automatically do this.

### Solution

The script was updated to explicitly load the file:

```bash
set -a
source "$(dirname "$0")/../backend/.env"
set +a
```

---

## Problem 2 — Writing the health log under `/var/log`

The health check writes to:

```text
/var/log/devops-nodejs-app-health.log
```

The normal `devops` user may not have permission to create or write this file.

The solution was to create the log file with elevated privileges and give ownership of the file to the `devops` user:

```bash
sudo touch /var/log/devops-nodejs-app-health.log
sudo chown devops:devops /var/log/devops-nodejs-app-health.log
```

The health check itself can then run without `sudo`.

This follows the principle of giving the script only the permissions it actually needs.

---

## Problem 3 — Understanding `npm ci`

It was important to distinguish dependency installation from application execution.

```bash
npm ci --omit=dev
```

only installs dependencies.

It does not start the Node.js application.

The application remains managed by systemd.

---

## Problem 4 — Understanding deployment commands

The deployment process uses:

```bash
git fetch origin main
git reset --hard origin/main
```

instead of relying only on `git pull`.

The two commands make the deployment process explicit:

1. Download the latest remote state.
2. Make the deployment working tree match that state.

This is appropriate for a deployment server where local code modifications should not be preserved.

---

# 12. Verification

The following parts of Phase 2 were verified:

* Bash scripts created under `scripts/`
* Scripts use `set -euo pipefail`
* Node.js and PostgreSQL setup script prepared
* Production dependencies installed using `npm ci --omit=dev`
* Deployment script restarts the systemd service
* Health check successfully targets `/health`
* Health check records timestamped results
* Cron configured for every five minutes
* PostgreSQL backup successfully created
* Backup file stored under `/opt/backups/`
* `.env` variables successfully loaded for the backup script

---

# 13. What I Learned

The main lesson from this phase was that Bash scripting is not just about memorizing commands.

I learned how individual Linux tools can be connected into an automated workflow.

For example:

```text
Git
 ↓
Bash
 ↓
npm
 ↓
systemd
 ↓
Node.js
 ↓
PostgreSQL
 ↓
pg_dump
 ↓
Backup
```

I also learned the difference between:

* A shell variable
* An exported environment variable
* A `.env` file
* A program such as `pg_dump`
* A cron job
* An exit code
* Output redirection

This phase provided the automation foundation for the next stages of the project.

---

# 14. Phase Result

Phase 2 is complete.

The project now has a basic automation layer that can:

```text
Prepare
   ↓
Deploy
   ↓
Verify
   ↓
Monitor
   ↓
Backup
```

The next phase is:

**Phase 3 — Git & GitHub**


