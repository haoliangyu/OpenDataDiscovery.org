# The config path is specified like this because the pm2 runs the app.json in
# its folder
tessera -c ./tile-server/config.json --port 8080 --bind 0.0.0.0
