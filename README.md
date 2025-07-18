﻿# RestroLink

A restaurant management system with a modern Angular frontend and Node.js backend.

## Prerequisites

- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) running on port 3006

## Project Structure

- `PAP-FrontEnd/` - Angular + Electron frontend
- `PAP-BackEnd/`  - Node.js + Express backend

## Setup Instructions


### 1. Install Dependencies

#### Frontend

```bash
cd PAP-FrontEnd
npm install
```

#### Backend

```bash
cd ../PAP-BackEnd
npm install
```

### 3. Configure the Database

- Ensure you have MySQL running on port 3006. WSL with docker or Xampp is recommended
- Import the schema on the project's root directory (restaurant.sql)
- Ensure MySQL is passwordless or change to prefered credentials in PAP-BackEnd/Config/EnviromentConfigs.ts (development)

### 4. Run the Project

- Simply press F5 or select the Run and Debug option "Launch All" (VSCode)

## License

[ISC](LICENSE)
