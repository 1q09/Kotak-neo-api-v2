# Positions

## Positions API

### Overview
The Positions API allows you to retrieve current day positions and overall positions for your trading account.

### Endpoint
`POST <Base_URL>/Portfolio/1.0/portfolio/v1/positions`

### Headers
- `Authorization: <your-api-token>`
- `Content-Type: application/json`

### Request Body
```json
{
    "Source": "N"
}
```

### Response Format

#### Success Response (200)
```json
{
    "Status": "Success",
    "message": "",
    "errorCode": "",
    "data": [
        {
            "tok": "11536",
            "dname": "Reliance Industries Ltd",
            "pos": "L",
            "netQty": "10",
            "avgPrice": "2450.50",
            "ltp": "2465.00",
            "pnl": "145.00",
            "pnlPerc": "0.59",
            "chg": "14.50",
            "chgPerc": "0.59",
            "es": "nse_cm",
            "ts": "RELIANCE-EQ"
        }
    ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| tok | string | Instrument token |
| dname | string | Display name of the instrument |
| pos | string | Position type (L=Long, S=Short) |
| netQty | string | Net quantity of position |
| avgPrice | string | Average price at which position was created |
| ltp | string | Last traded price |
| pnl | string | Profit and Loss value |
| pnlPerc | string | Profit and Loss percentage |
| chg | string | Price change from previous close |
| chgPerc | string | Price change percentage |
| es | string | Exchange segment |
| ts | string | Trading symbol |

### Error Responses

#### 401 Unauthorized
```json
{
    "Status": "Failed",
    "message": "Invalid or expired token",
    "errorCode": "401"
}
```

#### 403 Forbidden
```json
{
    "Status": "Failed", 
    "message": "Insufficient privileges",
    "errorCode": "403"
}
```

#### 500 Internal Server Error
```json
{
    "Status": "Failed",
    "message": "Internal server error",
    "errorCode": "500"
}
```

### Usage Example

```python
import requests

url = "<Base_URL>/Portfolio/1.0/portfolio/v1/positions"
headers = {
    "Authorization": "your-api-token",
    "Content-Type": "application/json"
}
payload = {
    "Source": "N"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

### Notes
- Positions are updated in real-time during market hours
- P&L calculations include brokerage and other charges
- Use this API to monitor your current trading positions
- Positions are reset to zero at the start of each trading day for intraday positions
