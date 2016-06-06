mkdir -p ../data
pg_dump -h localhost -U postgres -d odd -t instance \
                                        -t region \
                                        -t instance_region_level \
                                        | gzip -c > ../data/odd_instance.gz
