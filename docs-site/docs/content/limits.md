# Limits

## 1. Introduction

The **Limits API** allows you to query real-time available limits, margins, collateral, exposure, and cash balances for your trading account, filtered by segment, exchange, and product type.

## 2. API Endpoint

`POST <Base URL>/Orders/2.0/quick/user/limits`

*Replace `<Base URL>` with your Kotak Securities environment’s root.*

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| accept | string | `application/json` |
| Sid | string | Session ID obtained after login |
| Auth | string | Trade token generated after login  |
| neo-fin-key | string | Client key example “neotradeapi” |
| Content-Type | string | `application/x-www-form-urlencoded` |
| Authorization | string | API Token from NEO dashboard ( no "Bearer" prefix) |

## 4. Request

**Example Request:**

```jsx
curl --location '<Base URL>/Orders/2.0/quick/user/limits' \
--header 'accept: application/json' \
--header 'Sid: ******-****-****-****-**********' \
--header 'Auth: ***********' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: ************' \
--data-urlencode 'jData={"seg":"ALL","exch":"ALL","prod":"ALL"}'
```

## Request Body (`jData`)

| Name | Type | Description | Allowed Values | Default |
| --- | --- | --- | --- | --- |
| seg | string | Segment to fetch limits for | `ALL`, `CASH`, `CUR`, `FO` | ALL |
| exch | string | Exchange to fetch limits for | `ALL`, `NSE`, `BSE` | ALL |
| prod | string | Product to fetch limits for | `ALL`, `NRML`, `CNC`, `MIS` | ALL |

## 5. Response

## Example Success Response (truncated)

```jsx
{
    "Category": "CLIENT_MTF",
    "EntityId": "account-******",
    "BoardLotLimit": "5000",
    "CollateralValue": "10197.48",
    "Net": "10157.08",
    "MarginUsed": "40.4",
    "AdhocMargin": "0",
    "SpanMarginPrsnt": "0",
    "ExposureMarginPrsnt": "0",
    "NotionalCash": "0",
    "UnrealizedMtomPrsnt": "0",
    "RealizedMtomPrsnt": "0",
    "SpecialMarginPrsnt": "0",
    "PremiumPrsnt": "0",
    "MarginVarPrsnt": "0",
    "stCode": 200,
    "stat": "Ok"
}
```

## 200 Response Fields (most relevant)

| Field | Type | Description |
| --- | --- | --- |
| Category | string | Category |
| EntityId | string | Account ID |
| BoardLotLimit | string | Board lot limit |
| CollateralValue | string | Value of pledged securities/collateral |
| Net | string | Net available margin/cash |
| MarginUsed | string | Margin already used |
| AdhocMargin | string | Extra margin added |
| SpanMarginPrsnt | string | SPAN margin requirement |
| ExposureMarginPrsnt | string | Exposure margin requirement |
| NotionalCash | string | Notional (total) cash |
| UnrealizedMtomPrsnt | string | Unrealized Mark-to-Market (PnL) |
| RealizedMtomPrsnt | string | Realized Mark-to-Market (PnL) |
| SpecialMarginPrsnt | string | Special margin imposed |
| PremiumPrsnt | string | Premium margin present |
| MarginVarPrsnt | string | VAR margin present |
| stCode | int | Status code (200 = success) |
| stat | string | "Ok" for success |
| ... | ... | Additional technical/segment breakdown fields |

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
| stCode | int | Error code as below |

**Common Error Codes**

| Code | Description |
| --- | --- |
| 1002 | Invalid input parameters |
| 1003 | Invalid or expired session |
| 1005 | Internal server error |
| 429 | Too many requests |
| 500 | Unexpected server error |

## 6. Notes

- All numerical limits are provided as strings for precision.
- The response includes total cash, margin, and product/segment-wise breakdowns.
- Supply `"ALL"` for any parameter to fetch a consolidated report.
- Use the response fields such as `CollateralValue`, `Net`, `MarginUsed` to display funding or risk information on your interface.
- Use valid session and authentication tokens to avoid errors.