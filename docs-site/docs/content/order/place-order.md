# Place Order

## 1. Introduction

The **Place Order API** allows you to place buy or sell orders across all supported exchange segments and order types. It supports product types like NRML, CNC, MIS, CO, and BO, and includes specialized fields for Bracket Orders (BO) and Cover Orders (CO).

## 2. API Endpoint

`POST <Base URL>/Orders/2.0/quick/order/rule/ms/place`

*Replace `<Base URL>` with the correct Kotak Securities environment URL.*

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| accept | string | Should always be `application/json` |
| Sid | string | Session ID obtained after login (masked: ******--****) |
| Auth | string | Trade token generated after user login (masked) |
| neo-fin-key | string | Client key as issued from your NEO dashboard |
| Content-Type | string | Always `application/x-www-form-urlencoded` |
| Authorization | string | API Token from NEO dashboard (masked, no "Bearer" prefix) |

## 4. Request Body

The request body is sent as a single field named `jData`, which is a stringified JSON object and must be URL-encoded.

## Example Request

```jsx
curl --location '<Base URL>/Orders/2.0/quick/order/rule/ms/place' \
--header 'accept: application/json' \
--header 'Sid: ******-****-****-****-**********' \
--header 'Auth: ***********' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: ************' \
--data-urlencode 'jData={
  "am":"NO",
  "dq":"0",
  "es":"nse_cm",
  "mp":"0",
  "pc":"MIS",
  "pf":"N",
  "pr":"0",
  "pt":"L",
  "qt":"1",
  "rt":"DAY",
  "tp":"0",
  "ts":"ITBEES-EQ",
  "tt":"B"
}'
```

## Example Request Body (`jData`)

```jsx
{
  "am": "NO",
  "dq": "0",
  "es": "nse_cm",
  "mp": "0",
  "pc": "MIS",
  "pf": "N",
  "pr": "0",
  "pt": "L",
  "qt": "1",
  "rt": "DAY",
  "tp": "0",
  "ts": "******-**",
  "tt": "B",
  "sot": "",    *// Only for BO*
  "slt": "",    *// Only for BO*
  "slv": "",    *// Only for BO*
  "sov": "",    *// Only for BO*
  "tlt": "",    *// Only for BO*
  "tsv": ""     *// Only for BO*
}
```

## Request Body Fields

| Name | Type | Description | Allowed / Example Values |
| --- | --- | --- | --- |
| am | string | After Market Order flag. | "NO" (normal), "YES" (AMO) |
| dq | string | Disclosed quantity. | "0" or a partial quantity |
| es | string | Exchange segment code. | "nse_cm", "bse_cm", "nse_fo", "bse_fo", "cde_fo" |
| mp | string | Market protection value (used in some market orders). | "0" or numerical value |
| pc | string | Product code. | "NRML", "CNC", "MIS", "CO", "BO" |
| pf | string | Portfolio flag. | "N" |
| pr | string | Price for limit order, "0" for market order. | e.g. "0", "450.5" |
| pt | string | Order type. | "L" (Limit), "MKT" (Market), "SL" (Stoploss), "SL-M" (SL-Market) |
| qt | string | Order quantity. | e.g. "1", "100", etc. |
| rt | string | Validity or order duration. | "DAY", "IOC" |
| tp | string | Trigger price **(used for SL/SL-M/CO).** | "0" or actual trigger price.  |
| ts | string | Trading symbol (from scrip master file). | e.g., "ITBEES-EQ" |
| tt | string | Transaction type. | "B" (Buy), "S" (Sell) |
| sot | string | Square off type. Only for BO. | "Absolute", "Ticks" |
| slt | string | Stop loss type. Only for BO. | "Absolute", "Ticks" |
| slv | string | Stop loss value. Only for BO. | numeric (e.g. "5.00") |
| sov | string | Square off value. Only for BO. | numeric (e.g. "10.00") |
| tlt | string | Trailing stop loss indicator. Only for BO. | "Y" (yes), "N" (no) |
| tsv | string | Trailing stop loss value. Only for BO and if tlt is Y. | numeric (e.g. "2.00"), else "0" |

## 5. Response

## Example Success Response

```jsx
{
  "nOrdNo": "250720000007242",
  "stat": "Ok",
  "stCode": 200
}
```

## Success (200) Response Fields

| Name | Type | Description |
| --- | --- | --- |
| nOrdNo | string | Unique order number assigned to your request |
| stat | string | Status message, "Ok" if successful |
| stCode | int | HTTP status code, 200 for success |

## Example Error Response

```jsx
{
  "stat": "Not_Ok",
  "emsg": "Insufficient balance.",
  "stCode": 1004
}
```

## Error Response Fields

| Name | Type | Description |
| --- | --- | --- |
| stat | string | Status message, "Not_Ok" for errors |
| emsg | string | Error message in plain English |
| stCode | int | Error code (see below) |

## Error Codes

| Code | Description |
| --- | --- |
| 1002 | Invalid input parameters |
| 1003 | Invalid or expired session |
| 1004 | Insufficient funds or limits |
| 1005 | Internal server error |
| 1006 | Order could not be processed |
| 1007 | Exchange not reachable |
| 1008 | Market closed |
| 1009 | Invalid trading symbol |
| 1010 | Quantity not allowed / contract expired |
| 429 | Too many requests (rate limited) |
| 500 | Unexpected server error |

## **Tips & Notes**

- Make sure all header tokens and session information are obtained using prior authentication flows.
- Use the latest Scrip Master file to get correct trading symbols and instrument details.
- Use appropriate BO/CO fields **only** when placing Bracket or Cover orders.
- Handle all non-200 status codes in your integration for robust error management.