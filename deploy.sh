#!/bin/bash
echo -n "Project: "
read PROJECT
echo -n "Mode (local | development | staging | production): "
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

  # if [ -z "$INCLUDE_LIBS" ]
  # then
  #   INCLUDE_LIBS="-"
  # else
  #   INCLUDE_LIBS=$INCLUDE_LIBS
  # fi
  
  # echo "$INCLUDE_LIBS"
fi

echo "===== Build $PROJECT:$MODE =====" # ./deploy.sh cms staging
npx nest build $PROJECT
cd dist/apps/$PROJECT
rm $PROJECT-api-$MODE.tar.gz
cp ../../../yarn.lock .
cp ../../../package.json .
cp ../../../apps/$PROJECT/ecosystem-$MODE.config.js ecosystem.config.js
# && cp ../../../apps/$PROJECT/app.json .
tar -czvf $PROJECT-api-$MODE.tar.gz *

if [[ "$MODE" != 'local' ]]; then
  echo "===== Upload Build to Server ====="
  scp $PROJECT-api-$MODE.tar.gz root@$SERVER:/var/www/html/apps/$PROJECT-api-$MODE

  echo "===== Uploaded Successfully ====="
  rm $PROJECT-api-$MODE.tar.gz
  cd ..

  echo "===== WHAT'S NEXT ====="
  echo "sudo ssh -i ~/.ssh/id_rsa root@$SERVER"
  echo "cd /var/www/html/apps/$PROJECT-api-$MODE && tar -xzvf $PROJECT-api-$MODE.tar.gz"
  echo "yarn install"
  echo "pm2 restart $PROJECT-api-$MODE && pm2 log $PROJECT-api-$MODE"
fi