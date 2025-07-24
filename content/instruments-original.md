# Instruments

## Scrip Master API

## 1. Introduction

The **Scrip Master API** provides direct download links to the latest scrip master (instrument master) CSV files for all supported exchange segments. These files include instrument tokens, symbols, and other key data required for trading activities and symbol lookups.

## 2. API Endpoint

`GET <Base URL>/Files/1.0/masterscrip/v2/file-paths`

*Replace `<Base URL>` with the relevant Kotak environment root URL.*

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| Authorization | string | API token as generated in your NEO app or web dashboard. No "Bearer" prefix. |

## 4. Request

**Example Request**

```jsx
curl --location '<Base URL>/Files/1.0/masterscrip/v2/file-paths' \
--header 'Authorization: xxxxx-your-neo-token-xxxx'
```

*No request parameters or request body required.*

## 5. Response

## Example Success Response

```jsx
{
    "data": {
        "filesPaths": [
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed/cde_fo.csv",
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed/mcx_fo.csv",
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed/nse_fo.csv",
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed/bse_fo.csv",
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed/nse_com.csv",
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed-v1/bse_cm-v1.csv",
            "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/yyyy-mm-dd/transformed-v1/nse_cm-v1.csv"
        ],
        "baseFolder": "https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod"
    }
}
```

## 200 Response Fields

| Name | Type | Description |
| --- | --- | --- |
| filesPaths | array | Array of URLs – each is a download link to a CSV for one segment. |
| baseFolder | string | The root URL for retrieving CSV files (read-only). |

## Error Codes

| Code | Description |
| --- | --- |
| 401 | Unauthorized: Invalid or missing API token |
| 403 | Forbidden: Not enough privileges |
| 429 | Too many requests: API rate limited |
| 500 | Server error: Unexpected system error |

## 6. Response CSV Files column mapping to Orders & websocket APIs

| Column name | mapping | description |
| --- | --- | --- |
| pSymbol | Webscocket and Quotes API | this is passed along with pExchSeg with a separator in quotes and websocket APIs. example: nse_cm|11536&nse_cm|1594 |
| pExchSeg | Orders API as **‘es’** **field;**
Webscocket and Quotes API as part of query url | `Expected values are nse_cm, bse_cm, nse_fo, bse_fo, cde_fo` 
passed as a string in case of orders API |
| pTrdSymbol | Orders API as **‘ts’ field** | This refers to trading instrument in a way orders API interpret; passed as a string |
| lLotSize | Orders API as **‘qt’ field** | Quantity sent in place order should be in multiple of the lot size  |
| lExpiryDate | - | In case of contracts like in F&O, this represents the expiry date.  |

## 7. Example Workflow

1. Make a **GET** request with your Authorization token to the endpoint above.
2. On success, parse `filesPaths` to get the CSV URLs for downloading scrip/instrument master files for each segment (e.g., NSE F&O, BSE CM).
3. Download and use the CSV files to map instrument tokens to trading symbols and other details in your trading application.

## Notes

- Always use the latest download links; files update frequently, usually daily.
- Each file relates to a specific exchange segment (e.g., `nse_fo`, `bse_cm`).
- Download and cache these CSVs as needed for fast local symbol lookups.
- Always secure your API token and never share confidential links or files publicly.

---