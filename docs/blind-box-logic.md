# Blind Box Logic

## The Pool & Weights
Every Blind Box configuration has an associated pool of items (`BlindBoxItem`). Each item has:
- **enabled**: Boolean, can it be rolled?
- **inventory**: Int, how many are left?
- **weight**: Int, the relative chance of picking this item.

## Selection Algorithm (Weighted Random)
```javascript
// 1. Filter eligible pool items
const eligible = poolItems.filter(i => i.enabled && i.inventory > 0);

// 2. Sum up total weights
const totalWeight = eligible.reduce((acc, item) => acc + item.weight, 0);

// 3. Roll a number between 0 and totalWeight
let randomWeight = Math.random() * totalWeight;

// 4. Iterate and find selection
let selectedItem = null;
for (const item of eligible) {
  if (randomWeight < item.weight) {
    selectedItem = item;
    break;
  }
  randomWeight -= item.weight;
}
```

## Concurrency
Because multiple webhooks can hit exactly when stock is very low, the algorithm runs optimistically but finalizes the selection via native DB constraints:
```sql
UPDATE "BlindBoxItem" 
SET inventory = inventory - 1 
WHERE id = $selectedItemId AND inventory > 0;
```
If 0 rows are updated, the stock ran out mid-transaction, and the logic re-evaluates the array immediately.
