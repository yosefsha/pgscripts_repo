FROM postgres
COPY initdb.sql /docker-entrypoint-initdb.d
