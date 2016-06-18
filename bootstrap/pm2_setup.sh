echo -e "\n######## set up servers... ########\n"
pm2 start /vagrant/bootstrap/process.json --only odd.server --env production
pm2 start /vagrant/bootstrap/process.json --only odd.tile-server --env production

echo -e "\n######## enable servers auto-restart... ########\n"
sudo su -c "env PATH=$PATH:/usr/bin pm2 startup linux -u vagrant --hp /home/vagrant"

echo -e "\n######## save pm2 config... ########\n"
pm2 save
