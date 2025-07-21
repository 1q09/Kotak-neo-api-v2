# Holdings

## 1. Introduction

The **Holdings API** provides a detailed summary of the securities (stocks, ETFs, etc.) held in your account, including current market value, average price, quantity, and sellable quantity. Use this API to display or manage the current equity portfolio.

## 2. API Endpoint

`GET <Base URL>/Portfolio/1.0/portfolio/v1/holdings`

*Replace `<Base URL>` with your Kotak Securities environment’s root.*

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| accept | string | `application/json` |
| Sid | string | Session ID obtained after login  |
| Auth | string | Trade token generated after login  |
| neo-fin-key | string | Client key example “neotradeapi” |
| Content-Type | string | `application/json` |
| Authorization | string | API Token from NEO dashboard ( no "Bearer" prefix) |

## 4. Request

**Example Request:**

```jsx
curl --location '<Base URL>/Portfolio/1.0/portfolio/v1/holdings' \
--header 'accept: application/json' \
--header 'Sid: ******-****-****-****-**********' \
--header 'Auth: ***********' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/json' \
--header 'Authorization: ************'
```

*No request body or parameters required.*

## 5. Response

## Example Success Response (truncated)

```jsx
{
    "data": [
        {
            "displaySymbol": "IDEA",
            "averagePrice": 6.70,
            "quantity": 10,
            "exchangeSegment": "nse_cm",
            "exchangeIdentifier": "14366",
            "holdingCost": 66.95,
            "mktValue": 77.20,
            "instrumentToken": 8658,
            "instrumentType": "Equity",
            "closingPrice": 7.72,
            "symbol": "IDEA",
            "instrumentName": "Vodafone Idea Ltd",
            "sector": "Telecommunications - Service Provider",
            "sellableQuantity": 10,
            "securityType": "EQUITY STOCK",
            "securitySubType": "EQUITY STOCK"
        }
    ]
}
```

## 200 Response Fields

| Field | Type | Description |
| --- | --- | --- |
| displaySymbol | string | User-friendly symbol for display (e.g. IDEA) |
| averagePrice | float | Average acquisition price per share/unit |
| quantity | int | Total quantity held |
| exchangeSegment | string | Market segment (e.g. "nse_cm", "bse_cm") |
| exchangeIdentifier | string | Segment-unique identifier |
| holdingCost | float | Total acquisition cost for the holding |
| mktValue | float | Latest market value for the entire holding |
| scripId | string | Scrip identifier (internal) |
| instrumentToken | int | Unique instrument token |
| instrumentType | string | Type (Equity, ETF, etc.) |
| isAlternateScrip | boolean | True = alternate scrip, else false |
| closingPrice | float | Previous trading day closing price |
| symbol | string | Raw symbol (e.g. IDEA) |
| instrumentName | string | Full name of the instrument/company |
| sector | string | Sector of the security |
| sellableQuantity | int | Quantity available for selling |
| securityType | string | E.g., EQUITY STOCK |
| securitySubType | string | E.g., EQUITY STOCK |

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
| stCode | int | Error code (see explanations below) |

**Common Error Codes**

| Code | Description |
| --- | --- |
| 1002 | Invalid input parameters |
| 1003 | Invalid or expired session |
| 1005 | Internal server error |
| 429 | Too many requests |
| 500 | Unexpected server error |

## 6. Notes

- Only securities currently held in the portfolio are reported.
- `sellableQuantity` reflects what can be sold on the current trading day.
- Fields like `instrumentToken` and `exchangeSegment` are useful for placing new orders.
- Use valid session and auth tokens to avoid authentication errors.