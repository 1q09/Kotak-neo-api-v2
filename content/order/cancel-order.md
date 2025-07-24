# Cancel Order

## Cancel Order APIs (Regular, Bracket Order, Cover Order)

## 1. Introduction

Kotak Securities provides APIs for cancelling three types of open orders:

- **Regular Orders** (Equity, F&O, etc.)
- **Bracket Orders (BO)**
- **Cover Orders (CO)**

**Only the endpoint differs for BO/CO cancellations. All headers, request format, and responses remain consistent.**

Use these APIs to cancel pending orders before execution.

## 2. API Endpoints

| Order Type | Endpoint (after <Base URL>) |
| --- | --- |
| Regular Order | `/Orders/2.0/quick/order/cancel` |
| Bracket Order (BO) | `/Orders/2.0/quick/order/bo/exit` |
| Cover Order (CO) | `/Orders/2.0/quick/order/co/exit` |

**Replace `<Base URL>` with the appropriate Kotak Securities environment URL.**

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| accept | string | Should always be `application/json` |
| Sid | string | Session ID obtained after login  |
| Auth | string | Trade token generated after user login  |
| neo-fin-key | string | Client key example: “neotradeapi” |
| Content-Type | string | Always `application/x-www-form-urlencoded` |
| Authorization | string | API Token from NEO dashboard (no "Bearer" prefix) |

## 4. Request Body

The request body is a single URL-encoded field named `jData`, containing a JSON object.

## Example Request

```jsx
curl --location '<Base URL>/Orders/2.0/quick/order/cancel' \
--header 'accept: application/json' \
--header 'Sid: ******-****-****-****-**********' \
--header 'Auth: ***********' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: ************' \
--data-urlencode 'jData={
  "am":"YES",
  "on": "2105199703091997",
  "ts": "TCS-EQ"
}'
```

*For BO cancellation, just change endpoint to `.../quick/order/bo/exit`.*

*For CO cancellation, use `.../quick/order/co/exit`.*

## Example Request Body (`jData`)

```jsx
{
  "am": "YES",
  "on": "********************",
  "ts": "******-**"
}
```

## Request Body Fields

| Name | Type | Description | Required | Example |
| --- | --- | --- | --- | --- |
| am | string | AMO flag ("YES" for AMO orders; omit/"NO" for others) | Optional | "YES", "NO" |
| on | string | Nest order number (unique order id) | Required | "2105199703091997" |
| ts | string | Trading symbol (mandatory for AMO orders) | Optional | "TCS-EQ" |

## 5. Response

## Example Success Response

```jsx
{
  "nOrdNo": "2105199703091997",
  "stat": "Ok",
  "stCode": 200
}
```

## Success (200) Response Fields

| Name | Type | Description |
| --- | --- | --- |
| nOrdNo | string | Nest order number of the cancelled order |
| stat | string | Status, "Ok" if cancellation successful |
| stCode | int | HTTP status code, 200 for success |

## Example Error Response

```jsx
{
  "stat": "Not_Ok",
  "emsg": "Order already cancelled or not found.",
  "stCode": 1006
}
```

## Error Response Fields

| Name | Type | Description |
| --- | --- | --- |
| stat | string | "Not_Ok" for errors |
| emsg | string | Error message in English |
| stCode | int | Error code (see below) |

## Error Codes

| Code | Description |
| --- | --- |
| 1002 | Invalid input parameters |
| 1003 | Invalid or expired session |
| 1004 | Insufficient funds or limits |
| 1005 | Internal server error |
| 1006 | Already cancelled, executed, or order not found |
| 1007 | Exchange not reachable |
| 1008 | Market closed |
| 1009 | Invalid trading symbol |
| 1010 | Order not found |
| 429 | Too many requests (rate limited) |
| 500 | Unexpected server error |

## 6. Usage Notes

- **To cancel a regular, bracket, or cover order**, simply use the relevant endpoint with the same request fields and headers.
- For **AMO cancellation**, `"am": "YES"` and `"ts"` (trading symbol) are mandatory.
- Orders already fully executed or cancelled cannot be cancelled again.
- Use the exact `on` (Nest order number) as returned in the order placement or status queries.
- Always check for `"stat":"Ok"` in the response for a successful cancellation.