#!/bin/bash
# vercel部署脚本，根据环境变量VERCEL_ENV的值判断是生产环境还是dev环境

if [[ $VERCEL_ENV == "production"  ]] ; then 
  pnpm build && pnpm docs:build
else 
  pnpm build:staging && pnpm docs:build
fi