# Security Specification - AL KHALIL BUSINESS COMPAGNY

## Data Invariants
- Each product must have a positive price and non-negative stock.
- Sales must contain at least one item.
- Expenses must have a positive amount.
- Only administrators can perform write operations on products, settings, and sales.
- Reading PII (client emails/phones) is restricted to authenticated users.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to create a sale with a fake `authorId`.
2. **State Shortcutting**: Attempt to update a product price to 0.01 without admin role.
3. **Resource Poisoning**: Use a 2KB string as a `productId`.
4. **Shadow Update**: Add `isVerified: true` to a client document update.
5. **PII Leak**: Unauthenticated user trying to list all clients.
6. **Orphaned Write**: Create a sale item referencing a non-existent product.
7. **Negative Profit**: Create a sale where purchase price > selling price (integrity check).
8. **Unauthorized Settings Update**: Non-admin user trying to change the shop name.
9. **Deletion Theft**: Non-admin user trying to delete a sale record.
10. **Timestamp Fraud**: Providing a `createdAt` date from 1970.
11. **Balance Injection**: Manually updating `pointsFidelite` of a client document.
12. **Admin escalation**: Adding one's own UID to the `admins` collection.

## Test Runner (Mock)
The following operations must return `PERMISSION_DENIED`:
- `db.collection('products').add({ name: 'Hack', price: -5 })`
- `db.collection('settings').doc('general').update({ name: 'Owned' })` (as guest)
- `db.collection('clients').doc('any').update({ pointsFidelite: 999999 })`
