# Positions

## 1. Introduction

The **Positions API** provides a consolidated view of your open and closed positions for the current trading day across all supported segments. This allows you to track real-time exposures, quantities bought/sold, and settlement data.

## 2. API Endpoint

`GET <Base URL>/Orders/2.0/quick/user/positions`

*Replace `<Base URL>` with your Kotak Securities environment URL.*

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| accept | string | `application/json` |
| Sid | string | Session ID obtained after login |
| Auth | string | Trade token generated after login  |
| neo-fin-key | string | Client key ex “neotradeapi” |
| Content-Type | string | `application/json` |
| Authorization | string | API Token from NEO dashboard ( no "Bearer" prefix) |

## 4. Request

**Example Request:**

```jsx
curl --location '<Base URL>/Orders/2.0/quick/user/positions' \
--header 'accept: application/json' \
--header 'Sid: ******-****-****-****-**********' \
--header 'Auth: ***********' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/json' \
--header 'Authorization: ************'
```

*No request body or query params required.*

## 5. Response

## Example Success Response (truncated, user-friendly)

```jsx
{
  "stat": "Ok",
  "stCode": 200,
  "data": [
    {
      "actId": "******",
      "prod": "CNC",
      "exSeg": "nse_cm",
      "trdSym": "AXISBANK-EQ",
      "sym": "AXISBANK",
      "qty": "9",
      "buyAmt": "5862.90",
      "sellAmt": "0.00",
      "flBuyQty": "9",
      "flSellQty": "0",
      "brdLtQty": 1,
      "posFlg": "true",
      "sqrFlg": "Y",
      "lotSz": "1",
      "stkPrc": "0.00",
      "hsUpTm": "2022/06/21 15:11:02"
    },
    {
      "actId": "******",
      "prod": "CNC",
      "exSeg": "nse_cm",
      "trdSym": "ITC-EQ",
      "sym": "ITC",
      "qty": "15",
      "buyAmt": "4021.50",
      "sellAmt": "0.00",
      "flBuyQty": "15",
      "flSellQty": "0",
      "brdLtQty": 1,
      "posFlg": "true",
      "sqrFlg": "Y",
      "lotSz": "1",
      "stkPrc": "0.00",
      "hsUpTm": "2022/06/21 15:11:02"
    }
  ]
}
```

## 200 Response Fields

| Field | Type | Description |
| --- | --- | --- |
| stat | string | Overall status ("Ok" for success) |
| stCode | int | Status code (200 = success) |
| data | array | Array of position objects (see below) |

**Position Object (Key Fields):**

| Field | Type | Description |
| --- | --- | --- |
| actId | string | Account ID |
| prod | string | Product code (e.g., CNC, MIS, NRML) |
| exSeg | string | Exchange segment (e.g., nse_cm, bse_cm) |
| trdSym | string | Trading symbol (e.g., AXISBANK-EQ) |
| sym | string | Symbol name (e.g., AXISBANK) |
| qty | string | Net position quantity |
| buyAmt | string | Total buy amount |
| sellAmt | string | Total sell amount |
| flBuyQty | string | Filled buy quantity |
| flSellQty | string | Filled sell quantity |
| brdLtQty | int | Board lot quantity |
| posFlg | string | Position flag ("true" if open position) |
| sqrFlg | string | Square-off flag ("Y" = allowed) |
| lotSz | string | Lot size |
| stkPrc | string | Strike price (for derivatives) |
| hsUpTm | string | Last updated time |

*Other available fields*:

cfBuyAmt, cfSellAmt, cfBuyQty, cfSellQty, multiplier, precision, expDt, genNum, genDen, prcNum, prcDen, optTp, type

Note: cf as a prefix refers for carry forward

## Example Error Response

```jsx
{
  "stat": "Not_Ok",
  "emsg": "Invalid session",
  "stCode": 1003
}
```

| Field | Type | Description |
| --- | --- | --- |
| stat | string | "Not_Ok" for errors |
| emsg | string | Error message in English |
| stCode | int | Error code (see below) |

**Common Error Codes**

| Code | Description |
| --- | --- |
| 1002 | Invalid input parameters |
| 1003 | Invalid or expired session |
| 1005 | Internal server error |
| 429 | Too many requests |
| 500 | Unexpected server error |

## 6. Notes

- Only positions with actual trades for the day will be listed.
- Use the latest session and auth tokens.
- Quantities and amounts are strings for precision; convert as needed.
- Refer to the scrip master for segment, instrument, and symbol details.