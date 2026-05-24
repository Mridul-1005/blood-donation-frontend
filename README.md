# Blood Donation Monorepo

This repository now contains both applications under [blood-donation](blood-donation):

* [blood-donation/frontend](blood-donation/frontend) - Angular frontend
* [blood-donation/backend](blood-donation/backend) - Spring Boot backend

## Frontend

Run the frontend from [blood-donation/frontend](blood-donation/frontend):

```bash
npm install
npm start
```

## Backend

Run the backend from [blood-donation/backend](blood-donation/backend):

```bash
./mvnw test
./mvnw spring-boot:run
```

## Structure

The repo is organized as a simple monorepo so the frontend and backend stay side by side under one root folder.
