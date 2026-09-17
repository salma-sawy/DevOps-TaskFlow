# Phase 1 — Linux Fundamentals & systemd

## 🎯 Objective

The goal of Phase 1 was to move the application from **manual execution** to proper Linux service management.

The application should:

* Run under a dedicated non-root system user.
* Be managed by `systemd`.
* Start automatically when the server boots.
* Restart automatically when the application crashes.
* Store its logs in the systemd journal.
* Separate **code ownership/deployment** from **application execution**.

---

## 🧑‍💻 Users and Responsibilities

Two different accounts are used for different responsibilities:

```text
devops
│
├── Owns the application source code
├── Manages Git
├── git pull / checkout
├── Edits configuration and code
└── Performs deployment operations

nodeapp
│
├── System user
├── Does not manage Git
├── Does not modify the source code
└── Only runs the Node.js application
```

This follows the principle of **least privilege**.

The account responsible for deploying the application should be different from the account used to run it.

---

## 1. Create a Dedicated Service User

A system user named `nodeapp` was created:

```bash
sudo useradd -r -m -s /usr/sbin/nologin nodeapp
```

### What the options mean

```text
-r
Create a system user

-m
Create the user's home directory

-s /usr/sbin/nologin
Disable interactive login
```

### Why?

The application should not run as `root`.

Running the application with a dedicated service account limits what the application can access if it is compromised.

`nodeapp` is intentionally not used for Git or deployment operations.

---

## 2. Move the Application

The application was moved to `/opt`:

```bash
sudo mv /home/devops/DevOps-TaskFlow /opt/
```

The resulting application path is:

```text
/opt/DevOps-TaskFlow
```

---

## 3. Set the Repository Owner

The repository needs to be managed by the `devops` user because this account performs Git and deployment operations.

```bash
sudo chown -R devops:devops /opt/DevOps-TaskFlow
```

This gives `devops` ownership of:

* Application source code
* `.git` directory
* Configuration files
* Documentation
* Deployment files

This also allows Git commands such as:

```bash
git status
git pull
git checkout
```

to work normally without Git reporting a `dubious ownership` error.

---

## 4. Create a Shared Deployment Group

A shared group named `deploy` was created:

```bash
sudo groupadd deploy
```

Both users were added to the group:

```bash
sudo usermod -aG deploy nodeapp
sudo usermod -aG deploy devops
```

### Why?

The group provides a controlled way for `nodeapp` to access the application files without making `nodeapp` the owner.

The intended permission model is:

```text
devops
  ↓
owns + manages
  ↓
Application Repository
  ↑
read/execute
  │
nodeapp
  ↓
runs application
```

---

## 5. Give the Shared Group Access

The repository was assigned to the `deploy` group:

```bash
sudo chgrp -R deploy /opt/DevOps-TaskFlow
```

The group was given read and execute permissions:

```bash
sudo chmod -R g+rX /opt/DevOps-TaskFlow
```

### Why `g+rX`?

```text
g = group

r = read

X = execute/search permission where appropriate
```

The group can therefore read the application and traverse directories, but it does not receive write permission.

This means `nodeapp` can run the application but cannot modify its source code.

---

## 6. Preserve the Group for New Files

The setgid bit was enabled on the project directory:

```bash
sudo chmod g+s /opt/DevOps-TaskFlow
```

### Why?

The setgid bit causes newly created files and directories inside the project directory to inherit the `deploy` group.

This keeps group-based access consistent when new files are added later.

---

## 7. Refresh Group Membership

Group membership changes do not automatically affect the current shell session.

Log out and log back in, or use:

```bash
newgrp deploy
```

Then verify:

```bash
groups
```

Both `devops` and `nodeapp` should have `deploy` in their supplementary groups.

---

## 🔐 Permission Model

The final responsibility model is:

| User      | Role                   | Repository Ownership | Write Code | Run Application |
| --------- | ---------------------- | -------------------: | ---------: | --------------: |
| `devops`  | Deployment / developer |                  Yes |        Yes |    Not required |
| `nodeapp` | Service user           |                   No |         No |             Yes |

The important security principle is:

> The account running the application should not be able to modify the application it is running.

This reduces the impact of a compromised application process.

---

## 8. Create the systemd Unit

The service definition was created at:

```text
/etc/systemd/system/devops-taskflow.service
```

```bash
sudo vim /etc/systemd/system/devops-taskflow.service
```

### Service configuration

```ini
[Unit]
Description=DevOps TaskFlow Node.js Project
After=network.target postgresql.service

[Service]
Type=simple
User=nodeapp
WorkingDirectory=/opt/DevOps-TaskFlow/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5
EnvironmentFile=/opt/DevOps-TaskFlow/backend/.env

[Install]
WantedBy=multi-user.target
```

---

## 9. Understanding the Unit File

### `Type=simple`

The Node.js process runs in the foreground and is treated as the main process of the service.

### `User=nodeapp`

The application runs as the dedicated non-root `nodeapp` user.

This is independent from repository ownership.

### `WorkingDirectory`

```ini
WorkingDirectory=/opt/DevOps-TaskFlow/backend
```

Defines the directory from which the application is executed.

It is similar to:

```bash
cd /opt/DevOps-TaskFlow/backend
```

before starting the application.

### `ExecStart`

```ini
ExecStart=/usr/bin/node src/server.js
```

This is the command systemd uses to start the application.

### `Restart=on-failure`

systemd automatically restarts the application when it terminates because of a failure.

A normal graceful shutdown does not trigger this policy.

### `RestartSec=5`

systemd waits five seconds before attempting a restart.

### `EnvironmentFile`

```ini
EnvironmentFile=/opt/DevOps-TaskFlow/backend/.env
```

Loads environment variables required by the application.

The `.env` file contains environment-specific configuration and should not be committed to Git.

### `WantedBy=multi-user.target`

Allows the service to be enabled so that it starts during normal system boot.

---

## 10. Validate the Unit File

Before starting the service:

```bash
sudo systemd-analyze verify /etc/systemd/system/devops-taskflow.service
```

The command returned warnings related to unrelated system services, but no error was reported for the `devops-taskflow` unit.

---

## 11. Reload systemd

After creating or modifying the unit:

```bash
sudo systemctl daemon-reload
```

This tells systemd to reload its unit definitions.

---

## 12. Start the Service

```bash
sudo systemctl start devops-taskflow
```

Check the service status:

```bash
sudo systemctl status devops-taskflow
```

---

## 13. Enable the Service at Boot

```bash
sudo systemctl enable devops-taskflow
```

### Start vs Enable

```text
systemctl start
        ↓
Start the service now

systemctl enable
        ↓
Start the service automatically at boot
```

---

## 14. Verify the Process and Port

The Node.js process was checked through its listening port:

```bash
sudo ss -ltnp | grep :3000
```

This identifies the process listening on port `3000`.

The process can be terminated using:

```bash
kill <PID>
```

`kill` sends `SIGTERM` by default, allowing the application to shut down gracefully.

In this test, the Node.js application handled `SIGTERM`, closed the HTTP server, and exited successfully.

Because the service uses:

```ini
Restart=on-failure
```

a graceful `SIGTERM` does not trigger an automatic restart.

---

## 15. View Service Logs

systemd captures the application's output in the journal.

```bash
sudo journalctl -u devops-taskflow
```

Show the latest entries:

```bash
sudo journalctl -u devops-taskflow -n 50
```

Follow logs in real time:

```bash
sudo journalctl -u devops-taskflow -f
```

`-f` continuously displays new log entries, similar to `tail -f`.

---

## 🏗️ Architecture After Phase 1

```text
                    Ubuntu Server
                         │
                         ↓
                  systemd service
                         │
                         ↓
                    nodeapp user
                         │
                         ↓
                  Node.js / Express
                         │
                         ↓
                     PostgreSQL


        ┌─────────────────────────────┐
        │       Source Repository     │
        │                             │
        │  Owner: devops              │
        │  Group: deploy              │
        │                             │
        │  devops  → read/write       │
        │  nodeapp → read/execute     │
        └─────────────────────────────┘
```

---

## 🔄 Before vs After

### Phase 0

```text
User
 ↓
node src/server.js
 ↓
Application
```

The application had to be started manually.

### Phase 1

```text
systemd
   ↓
devops-taskflow.service
   ↓
nodeapp
   ↓
Node.js
   ↓
PostgreSQL
```

The application is now managed by Linux.

At the same time:

```text
devops
   ↓
Git / Deployment
   ↓
Application Repository
   ↑
read/execute
   │
nodeapp
```

The account managing the source code is separated from the account running the application.

---

## 📚 What I Learned

* Linux users and groups
* System users
* File ownership
* File and directory permissions
* Shared groups
* The setgid bit
* Processes and PIDs
* Listening ports
* `systemd` service management
* systemd unit files
* Service startup and restart behavior
* `journalctl` and service logs
* The principle of least privilege
* Separating deployment access from runtime access
* Why an application should not run as `root`
* Why the runtime user should not be able to modify its own source code

---

## ⚠️ Important Lesson

Initially, the entire repository was owned by `nodeapp`.

That caused Git to report:

```text
fatal: detected dubious ownership in repository
```

The issue revealed an important distinction:

> **The user that deploys and manages source code does not need to be the same user that runs the application.**

The final setup uses:

```text
devops  → owns and manages the repository
nodeapp → runs the application
deploy  → provides controlled shared access
```

This gives each account only the permissions required for its role.

---

## ✅ Phase 1 Result

The application was successfully converted from a manually started Node.js process into a **systemd-managed Linux service** running under a dedicated non-root user.

Repository ownership and runtime access were also separated using a shared `deploy` group.

**Next:** Phase 2 — Bash Scripting.

