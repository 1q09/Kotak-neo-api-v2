# Order Report APIs

## API Details

### 1. Order Report API (for today's orders)

**Endpoint:** `POST <Base_URL>/Orders/2.3/quick/order/report`

**Headers:**
- `Authorization: <your-api-token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
    "Source": "N"
}
```

**Response:**
Returns a list of today's orders with details like order ID, status, quantity, price, etc.

### 2. Order History API (for specific order details)

**Endpoint:** `POST <Base_URL>/Orders/2.3/quick/order/history`

**Headers:**
- `Authorization: <your-api-token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
    "Source": "N",
    "on": "order_id_here"
}
```

**Response:**
Returns detailed history and status updates for a specific order.

### 3. Trade Report API (for executed trades)

**Endpoint:** `POST <Base_URL>/Orders/2.3/quick/user/trades`

**Headers:**
- `Authorization: <your-api-token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
    "Source": "N"
}
```

**Response:**
Returns a list of executed trades with trade details, profit/loss, etc.

## Key Fields in Response

### Order Report Fields:
- `nOrdNo`: Order number
- `stat`: Order status (Complete, Rejected, Open, etc.)
- `ordSt`: Order side (B for Buy, S for Sell)
- `prc`: Order price
- `qty`: Order quantity
- `fldQty`: Filled quantity
- `ts`: Trading symbol
- `es`: Exchange segment

### Trade Report Fields:
- `trdSym`: Trading symbol
- `trdQty`: Trade quantity
- `trdPrc`: Trade price
- `ordSide`: Order side (B/S)
- `trdVal`: Trade value
- `flID`: Fill ID

## Error Codes

| Code | Description |
| --- | --- |
| 401 | Unauthorized: Invalid or missing API token |
| 403 | Forbidden: Not enough privileges |
| 422 | Validation Error: Invalid request parameters |
| 429 | Too many requests: API rate limited |
| 500 | Server error: Unexpected system error |

## Usage Notes

- Order Report API fetches all orders placed today
- Order History API requires a specific order ID to get detailed order lifecycle
- Trade Report API shows only executed/filled orders
- All APIs require valid authentication token
- Use appropriate Source field value as per your application type
