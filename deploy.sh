#!/bin/bash

# 🚀 Deploy DuckerChat para GitHub + Netlify

# 1. Mensagem de commit interativa
read -p "Mensagem do commit: " commit_msg

# 2. Git
echo "🔧 Commitando no Git..."
git add .
git commit -m "$commit_msg"
git push

# 3. Netlify
echo "🌐 Enviando para Netlify (produção)..."
netlify deploy --prod --dir=.

echo "✅ Deploy completo no GitHub e Netlify!"
