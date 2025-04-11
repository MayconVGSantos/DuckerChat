#!/bin/bash

# ===== SCRIPT DE DEPLOY RÁPIDO PARA NETLIFY =====
# Automatiza o processo de commit e deploy

# 1. PREPARAÇÃO DA MENSAGEM DE COMMIT
# Usa argumento como mensagem de commit ou solicita entrada
if [ -z "$1" ]; then
  read -p "Digite o nome do deploy (ex: Corrigir rolagem): " mensagem
else
  mensagem="$*"
fi

# 2. OPERAÇÕES GIT
# Adiciona, commita e envia alterações para o repositório
echo "📦 Commitando: $mensagem"
git add .
git commit -m "$mensagem"
git push

# 3. DEPLOY NETLIFY
# Envia os arquivos para o ambiente de produção do Netlify
echo "🌍 Enviando para produção no Netlify..."
netlify deploy --prod --dir=.

# 4. CONFIRMAÇÃO
echo "✅ Deploy concluído: $mensagem"