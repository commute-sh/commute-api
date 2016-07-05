#!/bin/bash

npm install
npm run dist

DATE=`date +%Y%m%d-%H%M%S`

aws s3 cp --profile commute --region us-east-1 dist.zip s3://hlx-lambda/commute-api-$DATE.zip