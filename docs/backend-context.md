# Backend Context

## App & Callback URLs
When installing this app on a SHOPLINE store:
- **App URL**: Maps to the backend root or entry route (e.g. `https://<your-host>/`). This handles the OAuth initiation.
- **Callback URL**: Maps to the backend OAuth callback route (e.g. `https://<your-host>/api/auth/callback`).

The backend handles the OAuth flow entirely, stores the merchant shop and access tokens, then redirects the merchant into the frontend admin UI or serves the frontend admin UI context.

## Route Structure
- `/api/auth/*` - Handles installation routing.
- `/api/admin/*` - Protected routes that serve information to the merchant UI.
- `/api/storefront/*` - Public routes providing Blind Box logic to the customer-facing storefront (no admin keys required, often protected by CORS and Storefront API contexts).
- `/api/webhooks/*` - Accepts webhooks directly from SHOPLINE.

## Modularity
We use strict separation of concerns into `/modules/`.
- **`blind-box-config/`**: CRUD operations to setup the probabilities.
- **`blind-box-assignment/`**: Logic to actually roll the dice and lock.
- **`shops/`**: Integration and credentials per store.
