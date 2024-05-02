#!/bin/bash

docker run --name rest-db \
    -p 5432:5432 \
    -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mydb \
    -v ./init.sql:/docker-entrypoint-initdb.d/init.sql \
    -d postgres:16-alpine
