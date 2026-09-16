# DevOps TaskFlow

**DevOps TaskFlow** is a full-stack Task Manager application that I am building and evolving throughout my **DevOps learning journey**.

 I will use the same application to practice each phase of the roadmap and gradually transform it from a simple local application into a production-style system.
 
 
 
This README is a **living document**. I will update it after completing each roadmap phase with what I learned, what I implemented, the problems I faced, and how the project evolved.

---

The project will evolve through the following journey:

```text
Application
    ↓
Linux
    ↓
Bash Scripting
    ↓
Git & GitHub
    ↓
Networking
    ↓
Docker
    ↓
AWS Cloud
    ↓
CI/CD
    ↓
Terraform
    ↓
Ansible
    ↓
Kubernetes    
    ↓
Monitoring & Logging
    ↓
GitOps
    ↓
DevSecOps
```

Each phase will add a new layer to the same project.

---

## 🏗️ Application Stack

The initial application consists of:

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Frontend:** HTML + CSS + Vanilla JavaScript

The application is a simple Task Manager that provides a practical application to deploy, containerize, automate, monitor, and secure throughout the DevOps journey.

---
## 🗺️ Future Project Struc
```text
devops-taskflow/
├── backend/                  # Phase 0.5 — Application
├── frontend/                 # Phase 0.5 — Application
│
├── scripts/                  # Phase 2 — Bash
│
├── deploy/                   # Phase 1 & 4 — Linux / Networking
│
├── docker-compose.yml        # Phase 5 — Docker
├── .dockerignore             # Phase 5 — Docker
│
├── Jenkinsfile               # Phase 7 — CI/CD
│
├── infra/                    # Phase 8 — Terraform
│
├── ansible/                  # Phase 9 — Ansible
│
├── k8s/                      # Phase 10 — Kubernetes
│
├── SECURITY.md               # Phase 13 — DevSecOps
│
├── .gitignore
└── README.md
```



## Phase 0 — Manual Application Deployment

Phase 0 focuses on getting the application running manually before introducing DevOps automation and infrastructure tools.

### Completed

- Set up an Ubuntu Server VM as the application server.
- Connected to the VM remotely using SSH.
- Installed the required baseline tools.
- Cloned the `DevOps-TaskFlow` repository from GitHub using SSH.
- Configured the application environment on the VM.
- Installed the Node.js backend dependencies.
- Configured PostgreSQL for the application.
- Started the Node.js application manually.
- Verified that the application works locally on the VM.
- Verified that the application is accessible from the Fedora host through the VM's IP address.

### Current Architecture

```text
Fedora Host
     │
     │ HTTP :3000
     ↓
Ubuntu Server VM
192.168.56.101
     │
     ↓
Node.js Backend
     │
     ↓
PostgreSQL
```

The application is currently started manually using the Node.js runtime. No systemd, Nginx, Docker, CI/CD, or cloud infrastructure has been introduced yet.

### Verification

The application was successfully accessed from the host machine using:

```text
http://192.168.56.101:3000
```

This confirms that the application is running successfully on the Ubuntu VM and is reachable from the host machine.

### Next Step

The next phase will move from manual execution to Linux service management by running the application as a `systemd` service under a dedicated non-root user.

