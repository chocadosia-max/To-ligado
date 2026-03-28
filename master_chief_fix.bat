@echo off
cd /d "C:\Users\tonil\Desktop\Tô Ligado"
git add src/contexts/AuthContext.tsx
git commit -m "fix: explicit redirect for auth"
git push origin main
npx --yes vercel --prod --yes
