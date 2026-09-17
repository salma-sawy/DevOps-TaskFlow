# DevOps TaskFlow

**DevOps TaskFlow** is a full-stack Task Manager application that I am building and evolving throughout my **DevOps learning journey**.

The same application is used across the roadmap to practice real-world DevOps concepts incrementally — starting with manual deployment on Linux and gradually evolving into a production-style system with automation, cloud infrastructure, CI/CD, containers, Kubernetes, monitoring, GitOps, and security.

> **This is a living project.**
> Each roadmap phase adds a new technical layer to the same application and is documented with the implementation, commands, decisions, problems, and lessons learned.

---

## 🎯 Project Goals

This project is designed to help me:

* Apply DevOps concepts to a real application instead of studying them in isolation.
* Understand how an application moves from development to production.
* Practice Linux administration, automation, networking, containers, cloud, and infrastructure.
* Build an end-to-end DevOps workflow step by step.
* Keep practical documentation of the decisions and problems encountered along the way.

---

## 🏗️ Application

DevOps TaskFlow is a simple Task Manager consisting of:

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Backend  | Node.js + Express               |
| Database | PostgreSQL                      |
| Frontend | HTML + CSS + Vanilla JavaScript |

The application itself is intentionally simple. The main focus of the project is **how the application is deployed, operated, automated, monitored, secured, and evolved using DevOps practices**.

---

## 🗺️ DevOps Journey

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

Each phase builds on the previous one rather than creating a separate project.

---

## 📌 Project Progress

* [x] **Phase 0 — Manual Application Deployment**
* [x] **Phase 1 — Linux Fundamentals & systemd**
* [ ] **Phase 2 — Bash Scripting**
* [ ] **Phase 3 — Git & GitHub**
* [ ] **Phase 4 — Networking**
* [ ] **Phase 5 — Docker**
* [ ] **Phase 6 — AWS Cloud**
* [ ] **Phase 7 — CI/CD**
* [ ] **Phase 8 — Terraform**
* [ ] **Phase 9 — Ansible**
* [ ] **Phase 10 — Kubernetes**
* [ ] **Phase 11 — Monitoring & Logging**
* [ ] **Phase 12 — GitOps**
* [ ] **Phase 13 — DevSecOps**

---

## 📂 Repository Structure

```text
devops-taskflow/
├── backend/                  # Node.js + Express application
├── frontend/                 # Frontend application
│
├── scripts/                  # Bash automation scripts
├── deploy/                   # Deployment and server configuration
│
├── docs/                     # Project documentation
│   ├── phase-0-manual-deployment.md
│   └── phase-1-linux-systemd.md
│
├── docker-compose.yml        # Docker / multi-container setup
├── .dockerignore
├── Jenkinsfile               # CI/CD pipeline
├── infra/                    # Terraform infrastructure
├── ansible/                  # Ansible configuration
├── k8s/                      # Kubernetes manifests
│
├── SECURITY.md               # Security documentation
├── .gitignore
└── README.md
```

> Some directories and files will be introduced gradually as their corresponding roadmap phases are completed.

---

## 🖥️ Current Environment

The application is currently deployed on an **Ubuntu Server VM** and managed using Linux system tools.

```text
Fedora Host
     │
     │ HTTP:3000
     ↓
Ubuntu Server VM
     │
     ├── systemd
     │      ↓
     │   Node.js
     │      ↓
     │   PostgreSQL
     │
     └── Application
```

---

## 📚 Documentation

Implementation details are kept separately from this README so that the repository overview remains concise.

### Completed Phases

* [Phase 0 — Manual Application Deployment](docs/phase-0-manual-deployment.md)
* [Phase 1 — Linux Fundamentals & systemd](docs/phase-1-linux-systemd.md)

Each phase documents:

* What was implemented
* Commands used
* Why each major step was necessary
* Problems encountered
* How they were solved
* Verification and results
* What was learned

---

## 🚀 Current Status



The application has moved from being manually started to being managed by `systemd` and runs under a dedicated non-root `nodeapp` user.


---

## 🔮 Final Goal

By the end of the roadmap, DevOps TaskFlow is intended to evolve from:

```text
Simple Application
       ↓
Linux Server
       ↓
Automated Deployment
       ↓
Dockerized Application
       ↓
AWS Infrastructure
       ↓
CI/CD Pipeline
       ↓
Infrastructure as Code
       ↓
Kubernetes
       ↓
Monitoring + Logging
       ↓
GitOps + DevSecOps
```

The goal is not just to deploy the application, but to understand and document the **complete lifecycle of running an application in a production-style DevOps environment**.

