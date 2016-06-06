mkdir -p ../data
pg_dump -h localhost -U postgres -d odd | gzip -c > ../data/odd.gz
