echo -e "\n######## Starting bootstrap process ########\n"

echo -e "\n######## install 1GB swap... ########\n"
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
printf "/swapfile   none    swap    sw    0   0\n" | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
printf "\nvm.swappiness=10\n" | sudo tee -a /etc/sysctl.conf
sudo sysctl vm.vfs_cache_pressure=50
printf "vm.vfs_cache_pressure=50\n" | sudo tee -a /etc/sysctl.conf
sudo swapon -s

echo -e "\n######## running apt-get update... ########\n"
sudo apt-get update

echo -e "\n######## installing some tools... ########\n"
sudo apt-get -y install gzip
sudo apt-get -y install git
sudo apt-get -y install curl

echo -e "\n######## install redis... ########\n"
sudo apt-add-repository -y ppa:chris-lea/redis-server
sudo apt-get -y install redis-server

echo -e "\n######## install nginx... ########\n"
sudo apt-get -y install nginx

echo -e "\n######## configuring nginx... ########\n"
sudo cp /vagrant/bootstrap/nginx.conf /etc/nginx/sites-available/
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/nginx.conf
sudo service nginx restart

echo -e "\n######## install postgresql... ########\n"
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" >> /etc/apt/sources.list'
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-9.5-postgis-2.2 postgresql-contrib-9.5 -y
sudo apt-get install -y postgresql-client-9.5

echo -e "\n######## copying database files... ########\n"
sudo cp /vagrant/bootstrap/pg_hba.conf /etc/postgresql/9.5/main/
sudo cp /vagrant/bootstrap/postgresql.conf /etc/postgresql/9.5/main/

echo -e "\n######## restarting postgresql... ########\n"
sudo service postgresql restart

echo -e "\n######## starting to create the postgis extension... ########\n"
sudo -u postgres psql -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -c "CREATE EXTENSION postgis_topology;"

echo -e "\n######## install node... ########\n"
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs

echo -e "\n######## install node tools... ########\n"
sudo npm install
sudo npm install -g pm2
sudo npm install -g gulp
sudo npm install -g mocha
sudo npm install -g istanbul
sudo npm install -g eslint
sudo npm install -g webpack
sudo npm install -g webpack-dev-server

echo -e "\n######## install tile server... ########\n"
sudo npm install -g mbtiles
sudo npm install -g tilelive
sudo npm install -g tilelive-vector
sudo npm install -g tilelive-xray
sudo npm install -g tessera

echo -e "\n######## install project dependencies... ########\n"
cd /vagrant
sudo npm install

echo -e "\n######## set up database... ########\n"
curl -o odd_dev_database.gz https://s3.amazonaws.com/open.data.discovery.org/odd_dev_database.gz
gzip -d odd_dev_database.gz

DB_USER="odd_admin"
DB_PASSWORD="Bko9tu39"

sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';";
sudo -u postgres psql -c "ALTER USER ${DB_USER} CREATEDB;"

export PGPASSWORD=$DB_PASSWORD
createdb -h localhost -U $DB_USER odd
sudo -u postgres psql -d odd -c "CREATE EXTENSION postgis;"
psql -h localhost -U $DB_USER -d odd -f odd_dev_database
psql -h localhost -U $DB_USER -d odd -c "REFRESH MATERIALIZED VIEW view_instance_region;"

rm odd_dev_database

echo -e "\n######## generate static files... ########\n"
cd www
webpack
cd ..

echo -e "\n######## install vector tile generator... ########\n"
sudo apt-get install libsqlite3-dev
sudo apt-get install zlib1g-dev
sudo apt-get install build-essential g++ -y
git clone https://github.com/mapbox/tippecanoe.git
cd tippecanoe
make
sudo make install
cd ..
rm -rf tippecanoe

echo -e "\n######## create initial tile server config... ########\n"
echo "{}" > tile-server/config.json

echo -e "\n######## start server... ########\n"
bash bootstrap/pm2_prod.sh
