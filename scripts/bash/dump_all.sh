mkdir -p ../data

export PGPASSWORD=Bko9tu39
pg_dump -h localhost -p 6060 -U odd_admin -d odd | gzip -c > ../data/odd.gz
