# Relayer service

Minimal Protocol Relay HTTP server for the Stellar Privacy SDK demo. The demo talks to this service through `@arcanetech/privacy-sdk-relay` (`createRelayApi`).

## Endpoints

- `POST /api/relay-requests` → `202` with `{ relayRequestId, status, createdAt, statusUrl }`
- `GET /api/relay-requests/:id`
- `POST /api/relay-requests/:id/attempts`

Request bodies are parsed with `deserializeRelayPackage`. The relayer then inspects KYT and submits `pool.transact` using `RELAYER_MNEMONIC` account `0`, or `RELAYER_SECRET` if set.

## Run

```bash
cp .env.example .env
# From backend-sdk-demo:
docker compose up --build
```

Local (Postgres already running):

```bash
npm install
npm run start:dev
```
