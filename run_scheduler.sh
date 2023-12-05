#!/bin/bash
PROJECT="ftp-to-s3"
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

# if [ -f ./apps/$PROJECT/.env.$MODE ]
# then
#   # Load Environment Variables
#   export $(cat ./apps/$PROJECT/.env.$MODE | grep -v '#' | awk '/=/ {print $1}')
#   # For instance, will be example_kaggle_key
#   SERVER=$IP_SERVER

#   # if [ -z "$INCLUDE_LIBS" ]
#   # then
#   #   INCLUDE_LIBS="-"
#   # else
#   #   INCLUDE_LIBS=$INCLUDE_LIBS
#   # fi
  
#   # echo "$INCLUDE_LIBS"
# fi

echo "===== Build $PROJECT:$MODE =====" # ./deploy.sh cms staging
npx nest build $PROJECT
cd dist/apps/$PROJECT
cp ../../../yarn.lock .
cp ../../../package.json .
if [ -f ~/env/.env.$MODE ]
then
  cp ~/env/.env.$MODE ./.env
else
  cp ~/env/.env ./.env
fi
cp ../../../apps/$PROJECT/ecosystem-$MODE.config.js ecosystem.config.js

yarn install
pm2 delete $PROJECT-$MODE || : && pm2 start && pm2 log $PROJECT-$MODE

cd ../../..
