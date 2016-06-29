mkdir -p ../data

export PGPASSWORD=Bko9tu39
pg_dump -h 52.87.229.42 -p 5432 -U odd_admin -d odd -s -f schema.sql
pg_dump -h 52.87.229.42 -p 5432 -U odd_admin -d odd -a -t instance \
                                            -t region \
                                            -t instance_region_level \
                                            -f instance_data.sql
tar -czvf odd_instance.tar.gz *.sql
mv odd_instance.tar.gz ../data/odd_instance.tar.gz
rm schema.sql
rm instance_data.sql
