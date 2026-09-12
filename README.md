# Carta

Cria um CV profissional em poucos minutos. Feito para candidaturas em Moçambique e na CPLP.

## O que faz

- Conta com e-mail ou número de telefone
- Modelos de CV distintos (Moderno, Executivo, ATS, e outros)
- Editor com pré-visualização em tempo real
- Foto de perfil com corte
- PDF A4 pronto a enviar
- Cada utilizador só vê os seus CVs

## Desenvolvimento

```bash
npm install
npm run dev
```

O servidor local corre em `http://localhost:8080`.

## Produção

Precisas de um Postgres (por exemplo Neon) e destas variáveis:

- `DATABASE_URL` — ligação Postgres
- `BETTER_AUTH_SECRET` — chave longa e aleatória
- `BETTER_AUTH_URL` — URL pública do site (ex. `https://carta-cv.netlify.app`)
- `VITE_AUTH_ENABLED=true`

Build:

```bash
npm run build
```
