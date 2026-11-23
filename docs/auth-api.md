# Auth API

Base path: `/api/v1/auth`

All requests use `Content-Type: application/json`.

None of these routes require an access token. Login returns `accessToken` and `refreshToken`.

## Response shape

Success:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

Validation error (`400`):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Phone number must be a valid 10 digit number"]
}
```

## Shared rules

| Field | Rule |
| --- | --- |
| `phone` | Required. 10 digits, starting with `6`, `7`, `8`, or `9`. |
| `otp` | Required. Exactly 6 digits. Valid for 5 minutes. |
| `id` | Required on verify. 24-character hex id returned by send OTP / admin login. |
| `email` | Required for admin. Valid email. Stored and compared in lowercase. |
| `password` | Required for admin login. At least 8 characters. |
| `fcmToken` | Optional on verify. Empty string and `null` are allowed. A new token is stored. Existing tokens are kept. At most the latest 3 tokens are kept. |
| OTP attempts | After 5 wrong OTPs the request returns `429`. Request a new OTP. |

A new send-OTP or admin login replaces the previous OTP for that account.

---

## 1. Send customer OTP

`POST /api/v1/auth/customer/send-otp`

Sends an OTP to an existing customer.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `phone` | string | yes |

```json
{
  "phone": "9876543210"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60718",
    "phone": "9876543210"
  }
}
```

`data.id` is required for verify.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `404` | Customer not found |

---

## 2. Verify customer OTP

`POST /api/v1/auth/customer/verify-otp`

Verifies the OTP and logs the customer in.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `phone` | string | yes |
| `otp` | string | yes |
| `id` | string | yes |
| `fcmToken` | string | no |

```json
{
  "phone": "9876543210",
  "otp": "123456",
  "id": "6741a0c2e1b2c3d4e5f60718",
  "fcmToken": "device-token"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "Customer logged in successfully",
  "data": {
    "user": {
      "id": "6741a0c2e1b2c3d4e5f60710",
      "name": "Customer Name",
      "email": null,
      "role": "customer",
      "photo": null,
      "phone": "9876543210"
    },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

`email` and `photo` are `null` when the customer has none.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `400` | OTP not found. Request a new OTP |
| `400` | OTP has expired |
| `400` | Invalid OTP |
| `404` | Customer not found |
| `429` | Too many invalid attempts. Request a new OTP |

---

## 3. Send agent OTP

`POST /api/v1/auth/agent/send-otp`

Sends an OTP to an active agent. The phone and role must match the same account.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `phone` | string | yes |
| `role` | string | yes. `team_lead` or `executive_manager` |

```json
{
  "phone": "9876543210",
  "role": "team_lead"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60718",
    "phone": "9876543210",
    "role": "team_lead"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `403` | Account is not active |
| `404` | Agent not found |

---

## 4. Verify agent OTP

`POST /api/v1/auth/agent/verify-otp`

Verifies the OTP and logs the agent in. Role is taken from the agent record.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `phone` | string | yes |
| `otp` | string | yes |
| `id` | string | yes |
| `fcmToken` | string | no |

```json
{
  "phone": "9876543210",
  "otp": "123456",
  "id": "6741a0c2e1b2c3d4e5f60718",
  "fcmToken": "device-token"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "Agent logged in successfully",
  "data": {
    "user": {
      "id": "6741a0c2e1b2c3d4e5f60711",
      "name": "Agent Name",
      "email": null,
      "role": "team_lead",
      "photo": null,
      "phone": "9876543210"
    },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

`user.role` is `team_lead` or `executive_manager`.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `400` | OTP not found. Request a new OTP |
| `400` | OTP has expired |
| `400` | Invalid OTP |
| `403` | Account is not active |
| `404` | Agent not found |
| `429` | Too many invalid attempts. Request a new OTP |

---

## 5. Admin login

`POST /api/v1/auth/admin/login`

Checks email and password, then sends an OTP. This does not return tokens.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `email` | string | yes |
| `password` | string | yes |

```json
{
  "email": "admin@cbsg.com",
  "password": "password123"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60718",
    "email": "admin@cbsg.com"
  }
}
```

`data.id` is required for verify.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `401` | Invalid email or password |
| `403` | Account is not active |

---

## 6. Verify admin OTP

`POST /api/v1/auth/admin/verify-otp`

Verifies the OTP and logs the admin in.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `email` | string | yes |
| `otp` | string | yes |
| `id` | string | yes |
| `fcmToken` | string | no |

```json
{
  "email": "admin@cbsg.com",
  "otp": "123456",
  "id": "6741a0c2e1b2c3d4e5f60718",
  "fcmToken": "device-token"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "user": {
      "id": "6741a0c2e1b2c3d4e5f60712",
      "name": "Admin Name",
      "email": "admin@cbsg.com",
      "role": "admin",
      "photo": null,
      "phone": "9876543210"
    },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

`user.role` is `admin` or `sub_admin`.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `400` | OTP not found. Request a new OTP |
| `400` | OTP has expired |
| `400` | Invalid OTP |
| `401` | Invalid email or OTP |
| `403` | Account is not active |
| `429` | Too many invalid attempts. Request a new OTP |
