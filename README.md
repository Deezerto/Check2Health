# Check2Health

Java Spring Boot app for pre-consultation and reservation. This guide shows how to run it locally on Windows PowerShell using the Maven Wrapper.

## Prerequisites

- JDK 17 or newer (JAVA_HOME set)
- MySQL 8.x running locally (or in Docker)

## Configure the Database

Create a database user (or use an existing one), then add these properties to `src/main/resources/application.properties`:

```properties
spring.application.name=check2health

# --- MySQL connection ---
spring.datasource.url=jdbc:mysql://localhost:3306/check2health?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password

# --- JPA/Hibernate (dev friendly) ---
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

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
## API Quickstart (Patients)

Endpoints are rooted at `/api/patients`.

```powershell
# Create
curl -Method Post -Uri http://localhost:8080/api/patients `
	-ContentType "application/json" `
	-Body '{
		"firstName":"Ana",
		"lastName":"Santos",
		"email":"ana@example.com",
		"username":"ana",
		"password":"Password1!",
		"phoneNumber":"+63 912 345 6789"
	}'

# List
curl http://localhost:8080/api/patients

# Get by id
curl http://localhost:8080/api/patients/1

# Update
curl -Method Put -Uri http://localhost:8080/api/patients/1 `
	-ContentType "application/json" `
	-Body '{"firstName":"Ana","lastName":"Cruz"}'

# Delete
curl -Method Delete -Uri http://localhost:8080/api/patients/1
```

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

