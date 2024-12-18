docker run -d \
  --name pgadmin \
  -p 8080:80 \
  -e PGADMIN_DEFAULT_EMAIL="admin@admin.com" \
  -e PGADMIN_DEFAULT_PASSWORD="admin" \
  dpage/pgadmin4

