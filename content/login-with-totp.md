# Login with TOTP

## **Overview**

The **Login with TOTP** authentication for Kotak Securities Trade API allows secure and automated user authentication by leveraging Time-based One-Time Passwords (TOTP). This is a two-step process:

1. **Step 1:** Validate the user's credentials and TOTP to receive a session token and view token.
2. **Step 2:** Use the session information and MPIN to complete the login and receive a trade token.

Below is comprehensive, user-friendly documentation for both steps.

## All endpoints below use the following **Base URL**:`<Base URL>/`

## Step 1: Login with TOTP

## 1. Introduction

Authenticate your account using mobile number, UCC, and TOTP. On success, you receive a view token (`token`), along with session identifiers to be used in the next step.

## 2. API Endpoint

```bash
POST <Base URL>/login/1.0/login/v6/totp/login
```

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| Authorization | string | Token provided in your NEO API dashboard (not prefixed by "Bearer") |
| neo-fin-key | string | Client key for Neo API, ex: neotradeapi |
| Content-Type | string | Always `application/json` |

## 4. Request Body

## Example Request

```bash
curl --location '<Base URL>/login/1.0/login/v6/totp/login' \
--header 'Authorization: xxxxx-your-neo-token-xxxx' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/json' \
--data '{
    "mobileNumber": "+91*******93",
    "totp": "******"
}'
```

**Example Request Body (JSON):**

```json
{
    "mobileNumber": "+91*******93",
    "totp": "******"
}
```

| Name | Type | Description |
| --- | --- | --- |
| mobileNumber | string | User's registered mobile number (with ISD) |
| ucc | string | Unique Client Code (Client ID) |
| totp | string | TOTP generated using authenticator app |

## 5. Response

**Success Example:**

```json
{
    "data": {…}
}
```

**Error Example:**

```json
{
    "status": "error",
    "errorCode": "401"
}
```

## Step 2: Validate MPIN (Trading Token Generation)

## 1. Introduction

Complete authentication by providing your 6-digit MPIN. You'll receive a trading token and session data required for authorized trading actions.

## 2. API Endpoint

```jsx
POST <Base URL>/login/1.0/login/v6/totp/validate
```

## 3. Headers

| Name | Type | Description |
| --- | --- | --- |
| Authorization | string | Token provided in your NEO API dashboard (not prefixed by "Bearer") |
| neo-fin-key | string | Client key for Neo API, available in your NEO app |
| Content-Type | string | Always `application/json` |
| sid | string | Session ID received from Step 1 (`sid` in response) |
| Auth | string | View token received from Step 1 (`token` in response) |

## 4. Request Body

**Example Request:**

```jsx
curl --location '<Base URL>/login/1.0/login/v6/totp/validate' \
--header 'Authorization: xxxxx-your-neo-token-xxxx' \
--header 'neo-fin-key: neotradeapi' \
--header 'Content-Type: application/json' \
--header 'sid: ******-****-****-****-**********' \
--header 'Auth: eyJhbGciOiJ...<masked>...' \
--data '{
    "mpin": "******"
}'
```

**Example Request Body (JSON):**

```jsx
{
    "mpin": "******"
}
```

| Name | Type | Description |
| --- | --- | --- |
| mpin | string | User's 6-digit MPIN |

## 5. Response

**Success Example:**

```json
{
    "data": {…}
}
```

**Error Example:**

```json
{
    "status": "error",
    "errorCode": "401"
}
```

## Common Response Fields

Both Step 1 and Step 2 return a `data` object with many similarities.

| Name | Type | Description & Possible Values |
| --- | --- | --- |
| token | string | JWT token. "View" token for Step 1 (`kType="View"`), "Trade" token for Step 2 (`kType="Trade"`). |
| sid | string | Session ID  |
| rid | string | Request ID for tracking  |
| hsServerId | string | Server ID. Usually empty. |
| isUserPwdExpired | boolean | Indicates if user's password has expired. |
| ucc | string | Unique Client Code (masked). |
| greetingName | string | Greeting name for user (masked) |
| isTrialAccount | boolean | Indicates if the account is a trial type |
| dataCenter | string | Data center code e.g., `E22` |
| searchAPIKey | string | Search API Key. Usually empty. |
| derivativesRiskDisclosure | string | SEBI Derivatives Risk Disclosure; usually lengthy disclaimer text |
| mfAccess | integer | Mutual Fund access: `1` means active |
| dataCenterMap | object | Mapping data for centers (can be null) |
| dormancyStatus | string | Account dormancy status, e.g., `A` |