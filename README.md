# Blood Donation Monorepo

This repository now contains both applications at the root level:

* [frontend](frontend) - Angular frontend
* [backend](backend) - Spring Boot backend

## Frontend

Run the frontend from [frontend](frontend):

```bash
npm install
npm start
```

## Backend

Run the backend from [backend](backend):

```bash
./mvnw test
./mvnw spring-boot:run
```

## Structure

The repo is organized as a simple monorepo so the frontend and backend stay side by side at the repository root.
