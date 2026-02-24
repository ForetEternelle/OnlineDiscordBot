# Image légère + sécurisée (pas Alpine: souvent plus pénible avec certains modules natifs)
FROM node:20-bookworm-slim

# Variables d'exécution (par défaut en prod)
ENV NODE_ENV=production \
    TZ=Europe/Paris

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl dumb-init \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -r -u 10001 -g root -m -d /app nodeapp

WORKDIR /app

COPY package*.json ./

# Install prod uniquement (plus léger, moins de dépendances)
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

# Droits minimaux
RUN chown -R nodeapp:root /app \
 && chmod -R u=rwX,g=rX,o= /app

USER nodeapp

ENTRYPOINT ["dumb-init", "--"]

# --- HEALTHCHECK ---
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "process.exit(require('child_process').execSync('ps -o comm= -p 1').toString().includes('node') ? 0 : 1)"

CMD ["node", "bot.js"]
