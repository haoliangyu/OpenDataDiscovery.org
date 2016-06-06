dropdb -h localhost -U postgres odd
createdb -h localhost -U postgres odd

gunzip -k ../data/odd_instance.gz
psql -h localhost -U postgres -d odd -f ../data/odd_instance
rm ../data/odd_instance
