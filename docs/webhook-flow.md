# Webhook & Idempotency Flow

## Event: `orders/paid`
When an order is paid, SHOPLINE fires an `orders/paid` webhook to our `/api/webhooks/orders-paid` endpoint.

## Execution Flow
1. **Signature Verification**: The backend verifies the `X-Shopline-Hmac-Sha256` header using the APP_SECRET to ensure the payload is from SHOPLINE.
2. **Idempotency Check**:
   - The app extracts the `x-shopline-delivery-id` or the `order.id` + `event_topic`.
   - Checks the `WebhookEvent` table. If the event ID exists, returns `200 OK` and aborts (preventing double assignments).
   - If not, inserts the event record with `PENDING` status.
3. **Parse Line Items**:
   - The app scans the order's line items and checks if the `product_id` matches any active `BlindBox` in the local DB.
4. **Assignment Queue/Execution**:
   - For every Blind Box line item purchased (taking quantity into account), it queries `BlindBoxItem` (pool items).
   - Randomly picks an item based on weights (excluding items with 0 stock or disabled).
   - Creates a transaction: Decrement item stock `WHERE id = chosen_id AND inventory > 0`, insert `Assignment` with `orderId`.
   - If the decrement fails (stock edge case), repeats the random pick.
5. **Success/Complete**:
   - Updates `WebhookEvent` status to `COMPLETED`.
   - Returns `200 OK` to SHOPLINE.
