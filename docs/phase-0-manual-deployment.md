# Phase 0 — Manual Application Deployment

## 🎯 Objective

The goal of Phase 0 was to get **DevOps TaskFlow** running manually on an Ubuntu Server VM before introducing automation or DevOps infrastructure tools.

This phase establishes the foundation for the rest of the project.

---

## 🖥️ Environment

```text
Host OS: Fedora Workstation
Server OS: Ubuntu Server
Connection: SSH
Application: Node.js + Express
Database: PostgreSQL
```

The Ubuntu VM acts as the initial application server.

---

## 1. Connect to the Ubuntu Server

The server was accessed remotely from the Fedora host using SSH.

```bash
ssh devops@<VM-IP>
```

### Why?

SSH provides remote command-line access to the Linux server and is the standard way to manage remote Linux machines.

---

## 2. Install Baseline Tools

The required system tools were installed on the Ubuntu server.

```bash
sudo apt update
sudo apt install -y curl wget git vim htop net-tools unzip build-essential
```

### Why?

These tools provide the basic environment required for development, troubleshooting, system administration, and later DevOps work.

---

## 3. Clone the Repository

The project repository was cloned from GitHub using SSH.

```bash
git clone git@github.com:<username>/DevOps-TaskFlow.git
cd DevOps-TaskFlow
```

### Why SSH?

Using Git over SSH allows the server to authenticate with GitHub without entering credentials for every operation.

---

## 4. Configure the Application

The application environment was configured on the Ubuntu server.

Environment-specific configuration was kept outside the source code and sensitive values were not committed to Git.

```text
.env
```

The `.env` file contains environment-specific configuration such as database connection information.

---

## 5. Install Backend Dependencies

The Node.js dependencies were installed inside the backend directory.

```bash
cd backend
npm install
```

### Why?

`npm install` reads the project's dependency definition and installs the packages required by the Node.js application.

---

## 6. Configure PostgreSQL

PostgreSQL was configured as the application's database on the Ubuntu server.

The application was connected to PostgreSQL using the configured environment variables.

```text
Node.js / Express
        │
        ↓
   PostgreSQL
```

---

## 7. Start the Application Manually

The backend was started directly using Node.js.

```bash
node src/server.js
```

At this stage, the application was running as a normal foreground process.

---

## 8. Verify the Application

The application was first verified from inside the Ubuntu VM.

The application was then accessed from the Fedora host through the VM's IP address:

```text
http://192.168.56.101:3000
```

### Result

The application was successfully reachable from the Fedora host.

---

## 🏗️ Phase 0 Architecture

```text
Fedora Host
     │
     │ HTTP :3000
     ↓
Ubuntu Server VM
192.168.56.101
     │
     ↓
Node.js + Express
     │
     ↓
PostgreSQL
```

---

## ⚠️ Limitations

At the end of Phase 0:

* The application had to be started manually.
* The application process was not managed by `systemd`.
* There was no automatic restart after a crash.
* The application was not configured to start automatically after reboot.
* Nginx had not been introduced.
* Docker and cloud infrastructure had not been introduced.

These limitations are intentional because later phases will solve them incrementally.

---

## 📚 What I Learned

* How a Linux VM can act as an application server.
* How to connect to a remote Linux server using SSH.
* How to install packages using `apt`.
* How to clone and manage a Git repository on a server.
* How Node.js applications run as Linux processes.
* How the application communicates with PostgreSQL.
* How to verify that a service is reachable through a server IP and port.

---

## ✅ Phase 0 Result

The application successfully moved from a local development environment to a manually configured Ubuntu Server VM.

**Next:** Phase 1 — Linux Fundamentals & systemd.

