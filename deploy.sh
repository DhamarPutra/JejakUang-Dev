#!/bin/bash

# build frontend
npm run build

# git add, commit, push DEV
git add .
echo "Masukkan pesan commit:"
read commit_msg
git commit -m "$commit_msg"
git push -u origin main

cp -r README.md dist/

# masuk ke folder public Laravel
cd dist || exit

# git add, commit, push PROD
git add .
git commit -m "$commit_msg"
git push -u origin main

echo "✅ Deploy selesai!"