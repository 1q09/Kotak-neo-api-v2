# Modify order

## 1. Introduction

The **Modify Order API** allows you to modify an already placed order’s parameters—such as quantity, price, validity, product type, and more—across supported segments and order types before it is executed or fully filled.

## 2. API Endpoint

`POST <Base URL>/Orders/2.0/quick/order/vr/modify`

*Replace `<Base URL>` with the root Kotak Securities environment URL.*

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| accept | string | Should always be `application/json` |
| Sid | string | Session ID obtained after login  |
| Auth | string | Trade token generated after user login  |
| neo-fin-key | string | Client key example “neotradeapi” |
| Content-Type | string | Always `application/x-www-form-urlencoded` |
| Authorization | string | API Token from NEO dashboard ( no "Bearer" prefix) |

## 4. Request Body

The request body uses a single field named `jData`, which is a URL-encoded JSON object.

## Example Request

```jsx
curl --location '<Base URL>/Orders/2.0/quick/order/vr/modify' \
--header 'accept: application/json' \
--header 'Sid: ******-****-****-****-**********' \
--header 'Auth: ***********' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: ************' \
--data-urlencode 'jData={
  "tk":"11536",
  "mp":"0",
  "pc":"NRML",
  "dd":"NA",
  "dq":"0",
  "vd":"DAY",
  "ts":"TCS-EQ",
  "tt":"B",
  "pr":"3001",
  "tp":"0",
  "qt":"10",
  "no":"220106000000185",
  "es":"nse_cm",
  "pt":"L"
}'
```

## Example Request Body (`jData`)

```jsx
{
  "tk": "*****",
  "mp": "0",
  "pc": "NRML",
  "dd": "NA",
  "dq": "0",
  "vd": "DAY",
  "ts": "******-**",
  "tt": "B",
  "pr": "3001",
  "tp": "0",
  "qt": "10",
  "no": "***************",
  "es": "nse_cm",
  "pt": "L"
}
```

## Request Body Fields

| Name | Type | Description | Allowed / Example Values |
| --- | --- | --- | --- |
| tk | string | Token (Instrument token from scrip master, as **pSymbol** column) | "11536", or as from the scrip master pSymbol column |
| fq | string | Filled Quantity (optional) | "10", "0" |
| mp | string | Market protection value | "0" |
| pc | string | Product code | "NRML", "CNC", "MIS", "CO", "BO" |
| dd | string | Date/Days (trailing validity, if applicable) | "NA" or as required |
| dq | string | Disclosed quantity | "0" or a partial quantity |
| vd | string | Validity (order duration) | "DAY", "IOC" |
| ts | string | Trading Symbol (from scrip master) | "TCS-EQ", etc. |
| tt | string | Transaction type | "B" (Buy), "S" (Sell) |
| pr | string | Price | e.g., "3001" |
| tp | string | Trigger price (for SL, SL-M) | "0" or actual trigger price |
| qt | string | Quantity | e.g., "10" |
| no | string | Nest Order Number (system order id for the original order) | e.g., "220106000000185" |
| es | string | Exchange Segment | "nse_cm", "bse_cm", "nse_fo", "bse_fo", "cde_fo" |
| pt | string | Order Type | "L" (Limit), "MKT" (Market), "SL" (Stoploss), "SL-M" (SL-Market) |

## 5. Response

## Example Success Response

```jsx
{
  "nOrdNo": "250720000007242",
  "stat": "Ok",
  "stCode": 200
}
```

## 200 Response Fields

| Name | Type | Description |
| --- | --- | --- |
| nOrdNo | string | New Order Number created or modified |
| stat | string | "Ok" if modification successful |
| stCode | int | HTTP status code, 200 for success |

## Example Error Response

```jsx
{
  "stat": "Not_Ok",
  "emsg": "Order cannot be modified as it is already executed.",
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
| 1006 | Order could not be processed / Already executed |
| 1007 | Exchange not reachable |
| 1008 | Market closed |
| 1009 | Invalid trading symbol |
| 1010 | Quantity not allowed / contract expired |
| 429 | Too many requests (rate limited) |
| 500 | Unexpected server error |

## Notes

- Only orders that are **not** yet executed or completed can be modified.
- Always use valid instrument tokens, symbols, and original order numbers.
- Headers and authorization must be handled securely as in the Place Order API.
- Use the latest scrip master data for token and symbol lookups.
- Use appropriate error handling for non-200 and failure responses.