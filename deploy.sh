#!/bin/bash

# 🚀 Deploy rápido DuckerChat com argumento opcional de nome

# 1. Usa argumento como mensagem de commit ou pergunta se não for passado
if [ -z "$1" ]; then
  read -p "Digite o nome do deploy (ex: Corrigir rolagem): " mensagem
else
  mensagem="$*"
fi

# 2. Git commit
echo "📦 Commitando: $mensagem"
git add .
git commit -m "$mensagem"
git push

# 3. Deploy para Netlify
echo "🌍 Enviando para produção no Netlify..."
netlify deploy --prod --dir=.

echo "✅ Deploy concluído: $mensagem"