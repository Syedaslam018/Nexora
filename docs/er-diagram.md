# NEXORA — Entity Relationship Diagram

Renders natively on GitHub (Mermaid). Mirrors `backend/prisma/schema.prisma`
exactly — regenerate this by hand if the schema changes, since there's no
live DB here to auto-diff against.

```mermaid
erDiagram
    USER ||--o{ ADDRESS : has
    USER ||--o| CART : owns
    USER ||--o| WISHLIST : owns
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ SESSION : has
    USER ||--o{ COUPON_USAGE : redeems

    CATEGORY ||--o{ CATEGORY : "parent of"
    CATEGORY ||--o{ PRODUCT : contains
    BRAND ||--o{ PRODUCT : makes

    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PRODUCT_IMAGE : has
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ WISHLIST_ITEM : "listed in"

    PRODUCT_VARIANT ||--|| INVENTORY : tracks
    PRODUCT_VARIANT ||--o{ INVENTORY_TRANSACTION : logs
    PRODUCT_VARIANT ||--o{ CART_ITEM : "added as"
    PRODUCT_VARIANT ||--o{ ORDER_ITEM : "ordered as"

    CART ||--o{ CART_ITEM : contains
    WISHLIST ||--o{ WISHLIST_ITEM : contains

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--o{ PAYMENT : "paid via"
    ORDER ||--o{ ORDER_STATUS_HISTORY : tracks
    ORDER ||--o| COUPON_USAGE : "used coupon via"
    ORDER }o--|| ADDRESS : "ships to"
    ORDER }o--o| COUPON : applies

    ORDER_ITEM ||--o| REVIEW : "reviewed via"

    COUPON ||--o{ COUPON_PRODUCT : restricts
    COUPON ||--o{ COUPON_CATEGORY : restricts
    COUPON ||--o{ COUPON_USAGE : "redeemed as"
    PRODUCT ||--o{ COUPON_PRODUCT : "eligible in"
    CATEGORY ||--o{ COUPON_CATEGORY : "eligible in"

    REVIEW ||--o{ REVIEW_IMAGE : has

    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum role "CUSTOMER|ADMIN|STAFF"
        bool isEmailVerified
        bool isActive
    }
    PRODUCT {
        uuid id PK
        string slug UK
        string sku UK
        int basePriceCents
        int compareAtPriceCents
        decimal avgRating
        int reviewCount
        bool isActive
        bool isArchived
    }
    PRODUCT_VARIANT {
        uuid id PK
        uuid productId FK
        string sku UK
        json attributes
        int priceCents "nullable override"
    }
    INVENTORY {
        uuid id PK
        uuid variantId FK "UK"
        int availableQty
        int reservedQty
        int soldQty
        int lowStockThreshold
    }
    ORDER {
        uuid id PK
        string orderNumber UK
        enum status
        int subtotalCents
        int discountCents
        int taxCents
        int shippingCents
        int totalCents
    }
    PAYMENT {
        uuid id PK
        uuid orderId FK
        enum provider "STRIPE|COD"
        enum status
        string stripePaymentIntentId UK
    }
    COUPON {
        uuid id PK
        string code UK
        enum type "PERCENTAGE|FIXED_AMOUNT|FREE_SHIPPING"
        int value
        int usageLimit
        int perUserLimit
    }
    REVIEW {
        uuid id PK
        uuid productId FK
        uuid userId FK
        uuid orderItemId FK "UK, nullable"
        int rating "1-5"
        enum status "PENDING|APPROVED|HIDDEN"
    }
```

## Key design decisions

- **`ProductVariant` is the unit of inventory and cart/order lines**, not
  `Product` — even single-variant products get one variant row. This avoids
  a special-cased "does this product have variants?" branch everywhere
  inventory, cart, and orders touch a product.
- **`Inventory` vs `InventoryTransaction`**: `Inventory` is the fast-read
  counter table the storefront checks for stock display; `InventoryTransaction`
  is the append-only ledger that makes reservation/release/sale auditable and
  replayable. Both are updated together inside one DB transaction.
- **Snapshots on `OrderItem`**: `productNameSnapshot`, `variantNameSnapshot`,
  `skuSnapshot`, `unitPriceCents` are copied at order time so a past order's
  displayed price/name never drifts if the product is later edited, repriced,
  or archived.
- **`Review.orderItemId`** is how "verified purchase" is derived structurally
  rather than by a boolean the user can lie about — a review is only linked
  to a specific delivered `OrderItem`, one review per `(productId, userId)`.
