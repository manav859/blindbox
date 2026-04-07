# Storefront API Contracts

## Retrieve Blind Box Definition
Used by the Storefront Theme (e.g., product page) to show possible prizes and probabilities (if public).

`GET /api/storefront/blind-box/:productId`

**Request:**
- Path param: `productId` (The SHOPLINE main product ID representing the container box).

**Response (200 OK):**
```json
{
  "id": "bb_123",
  "productId": "prod_abc",
  "items": [
    {
      "id": "item_1",
      "name": "Ultra Rare Golden Figure",
      "weight": 10,
      "inStock": true
    },
    {
      "id": "item_2",
      "name": "Common Silver Figure",
      "weight": 90,
      "inStock": true
    }
  ]
}
```

## Reveal Assigned Item
Used by the Storefront Theme on the Order Confirmation or Post-Purchase page to show customers what they received.

`GET /api/storefront/orders/:orderId/reveal`

**Response (200 OK):**
```json
{
  "orderId": "ord_123",
  "assignments": [
    {
      "blindBoxProductId": "prod_abc",
      "assignedItemId": "item_1",
      "assignedItemName": "Ultra Rare Golden Figure",
      "status": "COMPLETED"
    }
  ]
}
```
*(If pending, returns `"status": "PENDING"` so frontend can poll or show "Unlocking...").*
