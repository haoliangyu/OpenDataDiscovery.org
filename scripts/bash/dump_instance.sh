mkdir -p ../data
pg_dump -h localhost -U postgres -d odd -s -f schema.sql
pg_dump -h localhost -U postgres -d odd -a -t instance \
                                            -t region \
                                            -t instance_region_level \
                                            -f instance_data.sql
tar -czvf odd_instance.tar.gz *.sql
mv odd_instance.tar.gz ../data/odd_instance.tar.gz
rm schema.sql
rm instance_data.sql
