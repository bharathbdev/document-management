# NestJS Backend (User Management and Document Management)

## Purpose

This project is a backend service built using NestJS to manage user authentication, document management, and ingestion controls.


## Documentation

- [Database Design](./docs/entity-diagram.png)
- [Architecture](./docs/architecture_diagram.png)


## Key Features

### Authentication APIs
- **Register**: Create a new user account.
- **Login**: Authenticate users and issue JWT tokens.
- **Logout**: Invalidate user sessions.
- **User Roles**: Manage roles such as admin, editor, and viewer.

### User Management APIs
- **Admin-only functionality**: Manage user roles and permissions.

### Document Management APIs
- **CRUD Operations**: Create, read, update, and delete documents.
- **Upload Documents**: Upload and manage document files.

### Ingestion APIs
- **Ingestion Trigger API**: Trigger the ingestion process in the Python backend via a webhook or API call.
- **Ingestion Management API**: Track and manage ongoing ingestion processes.

## Tools and Libraries
- **TypeScript**: For consistent type management.
- **Postgres**: Recommended database for integration.
- **JWT**: For authentication and role-based authorization.

---



---

## Project Setup

### Install Dependencies
```bash
$ npm install
```

### Compile and Run the Project
```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

---

## Debugging

To debug the application, use the following command:
```bash
$ npm run start:debug
```

---

## Testing

### Run Unit Tests
```bash
$ npm run test
```

### Run Code Coverage
```bash
$ npm run test:cov
```

---

## Docker Setup

### Build and Run Docker Container
```bash
$ docker build -t document-management .
$ docker run -p 3000:3000 document-management
```

### Using Docker Compose
```bash
$ docker-compose up
```

---

## API Documentation (Swagger)

The project includes Swagger for API documentation. Once the application is running, you can access the Swagger UI at:

### Swagger URL
```plaintext
http://localhost:3000/api
```

---

## Key Development Practices and Tools

1. **SOLID Principles**:
   - Followed SOLID principles to ensure clean and maintainable code.

2. **Design Patterns**:
   - Used design patterns like Singleton to ensure efficient resource management.

3. **Swagger**:
   - Integrated Swagger for API documentation, enabling easy exploration and testing of APIs.

4. **Redis**:
   - Used Redis for caching ingestion statuses and improving performance.

5. **Webhook**:
   - Implemented webhooks to trigger ingestion processes in the Python backend.

6. **Microservice Architecture**:
   - Designed the application with a microservice architecture, separating authentication, document management, and ingestion services.

7. **Unit Test Coverage**:
   - Achieved over **80% unit test coverage** to ensure code reliability and maintainability.

8. **ESLint and Prettier**:
   - Used ESLint and Prettier for consistent code formatting and linting.

9. **GitHub Actions Pipeline**:
   - Configured a CI/CD pipeline using GitHub Actions for automated testing and deployment.

10. **Docker**:
    - Created Docker images for containerized deployment and used Docker Compose for multi-container setups.

11. **EC2 Deployment**:
    - Deployed the application on AWS EC2 instances for scalable and reliable hosting.

12. **AWS Services**:
    - **S3**: Used for document storage.
    - **Secrets Manager**: Used for securely managing environment variables.