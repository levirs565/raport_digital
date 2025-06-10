#!/bin/bash

set -e
cd apps/server
npx prisma migrate deploy
cd ../..
npx nx run @raport-digital/server:serve:production
