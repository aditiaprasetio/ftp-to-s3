#!/bin/bash
echo -n "Project: "
read PROJECT
echo -n "Mode (development | staging | production): "
read MODE

if [ -z "$PROJECT" ]
then
  echo "Project Not Found"
  exit
fi

if [ -z "$MODE" ]
then
  MODE="staging"
fi

if [ -f ./apps/$PROJECT/.env.$MODE ]
then
  # Load Environment Variables
  export $(cat ./apps/$PROJECT/.env.$MODE | grep -v '#' | awk '/=/ {print $1}')
  # For instance, will be example_kaggle_key
  SERVER=$IP_SERVER
  DOMAIN=$DOMAIN_SERVER
  PORT=$HTTP_PORT
fi

echo "===== WHAT'S NEXT (SETUP SERVER) ====="
echo "sudo ssh -i ~/.ssh/id_rsa root@$SERVER"

# Create Folder for Project
echo "===== CREATE PROJECT FOLDER ====="
echo "cd /var/www/html/apps"
echo "mkdir $PROJECT-api-$MODE"
echo "cd $PROJECT-api-$MODE"

# Init PM2
echo ""
echo "===== INIT PM2 ====="
echo 'echo "module.exports = {" > ecosystem.config.js'
echo 'echo "  apps : [{" >> ecosystem.config.js'
echo "echo $'    name   : \"$PROJECT-api-$MODE\",' >> ecosystem.config.js"
echo "echo $'    script : \"./main.js\",' >> ecosystem.config.js"
echo 'echo "    watch: true," >> ecosystem.config.js'
echo 'echo "    exp_backoff_restart_delay: 100" >> ecosystem.config.js'
echo 'echo "  }]" >> ecosystem.config.js'
echo 'echo "}" >> ecosystem.config.js'

# Init Nginx
echo ""
echo "===== INIT NGINX ====="
echo "cd /etc/nginx/sites-available"
echo "echo 'server {' > $PROJECT-api-$MODE"
echo "echo '        listen 80;' >> $PROJECT-api-$MODE"
echo "echo '        listen [::]:80;' >> $PROJECT-api-$MODE"
echo "echo ' ' >> $PROJECT-api-$MODE"
echo "echo '        root /var/www/html;' >> $PROJECT-api-$MODE"
echo "echo ' ' >> $PROJECT-api-$MODE"
echo "echo '        # Add index.php to the list if you are using PHP' >> $PROJECT-api-$MODE"
echo "echo '        index index.html index.htm index.nginx-debian.html;' >> $PROJECT-api-$MODE"
echo "echo ' ' >> $PROJECT-api-$MODE"
echo "echo '        server_name $DOMAIN;' >> $PROJECT-api-$MODE"
echo "echo ' ' >> $PROJECT-api-$MODE"
echo "echo '        location / {' >> $PROJECT-api-$MODE"
echo "echo '                proxy_pass http://localhost:$PORT;' >> $PROJECT-api-$MODE"
echo "echo '                proxy_http_version 1.1;' >> $PROJECT-api-$MODE"
echo "echo '                proxy_set_header Upgrade \$http_upgrade;' >> $PROJECT-api-$MODE"
echo "echo '                proxy_set_header Connection 'upgrade';' >> $PROJECT-api-$MODE"
echo "echo '                proxy_set_header Host \$host;' >> $PROJECT-api-$MODE"
echo "echo '                proxy_cache_bypass \$http_upgrade;' >> $PROJECT-api-$MODE"
echo "echo '        }' >> $PROJECT-api-$MODE"
echo "echo '}' >> $PROJECT-api-$MODE"

# Init Nginx - Create Alias
echo ""
echo "===== CREATE ALIAS NGINX FILE ====="
echo "cd /etc/nginx/sites-enabled"
echo "ln -s ../sites-available/$PROJECT-api-$MODE $PROJECT-api-$MODE"
echo "sudo systemctl restart nginx"
