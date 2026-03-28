@echo off
cd /d "C:\Users\tonil\Desktop\Tô Ligado"
echo "Building and deploying to production..."
npx --yes vercel --prod --yes
