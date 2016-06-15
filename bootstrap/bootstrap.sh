echo -e "\n######## Starting bootstrap process ########\n"
echo -e "\n######## running apt-get update... ########\n"
sudo apt-get update

echo -e "\n######## installing some tools... ########\n"
sudo apt-get -y install unzip
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

echo -e "\n######## install postgresql... ########\n"
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-9.5-postgis-2.2 postgresql-contrib-9.5 -y

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

echo -e "\n######## install project dependencies... ########\n"
cd /vagrant
sudo npm install

echo -e "\n######## set up database... ########\n"
gunzip -k /vagrant/scripts/data/odd_instance.gz

DB_USER="odd_admin"
DB_PASSWORD="Bko9tu39"

sudo -u postgres createdb odd
sudo -u postgres psql -c "CREATE EXTENSION postgis;";
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';";
sudo -u postgres psql -c "ALTER USER ${DB_USER} CREATEDB;";
sudo -u postgres psql -c "GRANT ALL PRIVILEGES on DATABASE odd to ${DB_USER};"
sudo -u postgres psql -w odd -f /vagrant/scripts/data/odd_instance

rm /vagrant/scripts/data/odd_instance

echo -e "\n######## set up servers... ########\n"
pm2 start /vagrant/bootstrap/process.json --only odd.server --env production
pm2 start /vagrant/bootstrap/process.json --only odd.tile-server --env production
