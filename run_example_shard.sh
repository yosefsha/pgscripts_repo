#!/bin/bash

# Default port if not provided
LAST_DIGIT=${1:-2}
PORT="543${LAST_DIGIT}"
NAME="my_postgres${LAST_DIGIT}"

docker run -d \
  --name $NAME \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secretpassword \
  -e POSTGRES_DB=mydb \
  -v $(pwd)/initdb.sql:/docker-entrypoint-initdb.d/initdb.sql \
  -p $PORT:5432 \
  postgres

