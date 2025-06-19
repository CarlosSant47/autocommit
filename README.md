# Autocommit with GitHub Copilot API

# Copilot API

⚠️ **EDUCATIONAL PURPOSE ONLY** ⚠️
This project is a reverse-engineered implementation of the GitHub Copilot API created for educational purposes only. It is not officially supported by GitHub and should not be used in production environments.


## Project Overview

Autocommit permite generar los mensajes de tus commits para tus repositorios utilizando la API de Github Copilot **(Proximanete con otros proveedors de IA)**






## Build


### Prerequisites

- Bun (>= 1.2.x)
- GitHub account with Copilot subscription (Individual or Business)
### Installation
To install dependencies, run:

```sh
npm install
```

## Command Structure
Copilot API now uses a subcommand structure
- `commit`: Genera el men saje del commit en base al git verbose
- `config global` : Abre la carpeta donde se encuentra la configuracion
- `config auth` : Permite autenticarnos con las API de Github Copilot
- `config model` : Permite configurar el modelo predeterminado para la generacion del mensaje del commit (Se requiere iniciar sesion primero)





