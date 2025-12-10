# Check2Health

Java Spring Boot app for pre-consultation and reservation. This guide shows how to run it locally on Windows PowerShell using the Maven Wrapper.

## Prerequisites

- JDK 17 or newer (JAVA_HOME set)
- MySQL 8.x running locally
- MySQL Workbench (optional but recommended for database management)

## MySQL Workbench Setup

1. **Install MySQL Server and MySQL Workbench** from here: 
    - MySQL Workbench: https://dev.mysql.com/downloads/workbench/
	- MySQL Server: https://dev.mysql.com/downloads/mysql/ (Community Server - 8.0.44 MSI Installer)

2. **Start MySQL Server** (should auto-start on Windows after installation)

3. **Open MySQL Workbench** and create a connection:
   - Click **+** next to "MySQL Connections"
   - Connection Name: `Local Check2Health`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `root` (or your MySQL user)
   - Click **Test Connection**, enter your password, then **OK**

4. **Create the database and user**
   - Open the connection, then run these SQL commands:

```sql
CREATE DATABASE IF NOT EXISTS check2health;
CREATE USER IF NOT EXISTS 'c2h_user'@'%' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON check2health.* TO 'c2h_user'@'%';
FLUSH PRIVILEGES;
```
	- Creating a new user is optional, you can use root if you want to.

5. **Update `src/main/resources/application.properties`** with your credentials:
   - If using `root`: keep `username=root` and set your root password
   - If using the new user (see step 4): set `username=c2h_user` and `password=StrongPass123!`

6. **Verify the setup:**
   - Run the Spring Boot app (see Build and Run below)
   - In Workbench, refresh Schemas → expand `check2health` → you should see the `patients` table
   - Query it: `SELECT * FROM patients;`

**Troubleshooting:**
- Authentication errors: run `ALTER USER 'c2h_user'@'%' IDENTIFIED WITH mysql_native_password BY 'StrongPass123!';`
- Connection refused: ensure MySQL service is running (Windows Services → MySQL80)

## Configure the Database

The backend is pre-configured for MySQL in `src/main/resources/application.properties`.

**Default settings:**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/check2health?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Update `username` and `password` to match your MySQL credentials (from Workbench setup above).

If MySQL is not installed, you can use Docker:

```powershell
docker run -d --name mysql-check2health -p 3306:3306 -e MYSQL_ROOT_PASSWORD=your_password mysql:8
```

## Build and Run

From the project root (`c:\Users\user\Desktop\Check2Health`):

```powershell
# Build (skips tests)
./mvnw.cmd -DskipTests package

# Run the app
./mvnw.cmd spring-boot:run
```

Alternatively run the packaged JAR:

```powershell
java -jar target/check2health-0.0.1-SNAPSHOT.jar
```

The API will listen on `http://localhost:8080` by default.

## Frontend (React)

The repository includes a React app in `frontend/` (Vite).

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Assets (logo/images) belong in `frontend/public/assets/`.

## Project Structure (key parts)

```
src/main/java/com/appdev/lastico/check2health/
	Controller/PatientController.java   # REST endpoints
	Service/PatientService.java         # Business logic
	Repository/PatientRepository.java   # Spring Data JPA repository
	Entity/Patient.java                 # JPA entity
```

## Common Issues

- Port 8080 in use: set `server.port=8081` in `application.properties`.
- `mvn` not recognized: always use the wrapper `mvnw.cmd` shown above.
- MySQL connection errors: verify host/port, user/password, and that the DB allows TCP connections.

## Members:

- Teodoro Jr. Castillo (teodoro.castillojr@cit.edu)
- Elvin Lagamo Jr. (elvin.lagamo@cit.edu)
- German Oliver Velasco (germanoliver.velasco@cit.edu)

