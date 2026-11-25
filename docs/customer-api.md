# Customer API

Base path: `/api/v1/customer`

Every route requires a customer access token, except help and support.

```
Authorization: Bearer <accessToken>
```

The token must belong to a customer. Any other account receives `403` with message `Customer access required`.

JSON routes use `Content-Type: application/json`. Profile update uses `multipart/form-data`.

| Method | Path |
| --- | --- |
| `GET` | `/api/v1/customer/help-support` |
| `GET` | `/api/v1/customer/notifications` |
| `GET` | `/api/v1/customer/logout` |
| `GET` | `/api/v1/customer/kyc/status` |
| `PATCH` | `/api/v1/customer/kyc/:id` |
| `GET` | `/api/v1/customer/profile` |
| `PATCH` | `/api/v1/customer/profile` |
| `DELETE` | `/api/v1/customer/profile` |
| `GET` | `/api/v1/customer/bank` |
| `POST` | `/api/v1/customer/bank` |
| `PATCH` | `/api/v1/customer/bank` |
| `DELETE` | `/api/v1/customer/bank` |
| `GET` | `/api/v1/customer/dashboard` |
| `POST` | `/api/v1/customer/transactions/saving` |
| `POST` | `/api/v1/customer/transactions/withdrawal` |
| `GET` | `/api/v1/customer/transactions` |
| `GET` | `/api/v1/customer/plans` |

## Response shape

Success:

```json
{
  "success": true,
  "message": "Profile fetched successfully",
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
  "errors": ["At least one field is required"]
}
```

Missing or expired token (`401`):

```json
{
  "success": false,
  "message": "Authentication token required"
}
```

---

## 1. List notifications

`GET /api/v1/customer/notifications`

Returns notifications stored for the `USER` role, newest first. Each page contains 15 notifications.

### Query

| Field | Type | Required |
| --- | --- | --- |
| `page` | integer | no. Default `1` |

### Success `200`

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "id": "6741a0c2e1b2c3d4e5f60720",
        "role": "USER",
        "heading": "Welcome",
        "body": "Your account is ready.",
        "type": "INFO",
        "isRead": false,
        "createdAt": "2026-11-23T06:30:00.000Z",
        "updatedAt": "2026-11-23T06:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 15,
      "total": 32,
      "totalPages": 3
    }
  }
}
```

`notifications` is an empty array and `total` is `0` when there are no notifications. The next page is `?page=2`.

---

## 2. Help and support

`GET /api/v1/customer/help-support`

No access token is required.

### Success `200`

```json
{
  "success": true,
  "message": "Help and support fetched successfully",
  "data": {
    "name": "CBSG Customer Support",
    "phone": "9999999999",
    "questions": [
      {
        "question": "How do I complete my profile?",
        "answer": "After login, save your father's name, date of birth, and upload your Aadhaar and PAN documents."
      }
    ]
  }
}
```

---

## 3. Logout

`GET /api/v1/customer/logout`

Refresh token and FCM token are optional query parameters. A token is removed from the account only when it is sent.

### Query

| Field | Type | Required |
| --- | --- | --- |
| `refreshToken` | string | no |
| `fcmToken` | string | no |

### Success `200`

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "refreshTokenRemoved": true,
    "fcmTokenRemoved": false
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `400` | Refresh token must be a string |
| `400` | FCM token must be a string |
| `400` | Refresh token is too long |
| `400` | FCM token is too long |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 4. Get KYC status

`GET /api/v1/customer/kyc/status`

Creates a pending KYC record the first time it is requested.

Each section has `status` and `rejectionReason`. Every section except `photo` also has `rejectedFields`. Section `status` is one of `PENDING`, `IN_PROGRESS`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`. The top-level `status` uses the same values.

Rejected field names:

| Section | Fields |
| --- | --- |
| `personalDetails` | `name`, `phone`, `fathersName`, `dob` |
| `address` | `address`, `pinCode` |
| `aadhar` | `aadhar`, `aadharDocument` |
| `pan` | `pan`, `panDocument` |
| `photo` | none |
| `bankAccount` | `bankName`, `accountNumber`, `ifscCode` |
| `nominee` | `nomineeName`, `nomineeRelation` |

### Success `200`

```json
{
  "success": true,
  "message": "KYC status fetched successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60730",
    "userId": "6741a0c2e1b2c3d4e5f60710",
    "personalDetails": {
      "status": "PENDING",
      "rejectionReason": null,
      "rejectedFields": {
        "name": false,
        "phone": false,
        "fathersName": false,
        "dob": false
      }
    },
    "address": {
      "status": "PENDING",
      "rejectionReason": null,
      "rejectedFields": {
        "address": false,
        "pinCode": false
      }
    },
    "aadhar": {
      "status": "PENDING",
      "rejectionReason": null,
      "rejectedFields": {
        "aadhar": false,
        "aadharDocument": false
      }
    },
    "pan": {
      "status": "PENDING",
      "rejectionReason": null,
      "rejectedFields": {
        "pan": false,
        "panDocument": false
      }
    },
    "photo": {
      "status": "PENDING",
      "rejectionReason": null
    },
    "bankAccount": {
      "status": "PENDING",
      "rejectionReason": null,
      "rejectedFields": {
        "bankName": false,
        "accountNumber": false,
        "ifscCode": false
      }
    },
    "nominee": {
      "status": "PENDING",
      "rejectionReason": null,
      "rejectedFields": {
        "nomineeName": false,
        "nomineeRelation": false
      }
    },
    "status": "PENDING",
    "verifiedAt": null,
    "createdAt": "2026-11-23T06:30:00.000Z",
    "updatedAt": "2026-11-23T06:30:00.000Z"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |

---

## 5. Update KYC

`PATCH /api/v1/customer/kyc/:id`

`:id` is the KYC id from the status response. Only the logged-in customer's KYC can be updated. Send at least one section.

Send one or more section objects. A section can include `status`, `rejectionReason`, and `rejectedFields`. `photo` has no `rejectedFields`.

The top-level `status` is `VERIFIED` when every section is verified, `REJECTED` when any section is rejected, `UNDER_REVIEW` when every section is under review or verified, and `IN_PROGRESS` when only some sections have moved past pending.

`VERIFIED` and `REJECTED` records cannot be updated.

### Body

```json
{
  "personalDetails": {
    "status": "REJECTED",
    "rejectionReason": "Name does not match the document",
    "rejectedFields": {
      "name": true,
      "phone": false,
      "fathersName": false,
      "dob": false
    }
  }
}
```

### Success `200`

The response uses the same section objects as get KYC status. Message is `KYC updated successfully`.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `400` | Invalid id |
| `400` | This KYC can no longer be updated |
| `401` | Invalid customer session |
| `403` | You can only update your own KYC |
| `404` | KYC not found |

---

## 6. Get profile

`GET /api/v1/customer/profile`

Returns the logged-in customer's profile. `filledFields` is how many of the 18 profile fields have a value. `totalFields` is always `18`.

### Success `200`

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60710",
    "name": "Asha Patel",
    "email": "asha@example.com",
    "photo": null,
    "phone": "9876543210",
    "joiningDate": "2026-01-15T00:00:00.000Z",
    "fathersName": "Ramesh Patel",
    "dob": "1995-04-12T00:00:00.000Z",
    "address": "12 Market Road",
    "pinCode": "380001",
    "aadhar": "234567890123",
    "aadharDocument": null,
    "pan": "ABCDE1234F",
    "panDocument": null,
    "nominee": null,
    "nomineeRelation": null,
    "bankName": null,
    "accountNumber": null,
    "ifscCode": null,
    "filledFields": 10,
    "totalFields": 18
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 7. Update profile

`PATCH /api/v1/customer/profile`

Updates only the customer in the access token. Send at least one field, or one file. Empty string clears a nullable field. When all 18 profile fields have a value, a KYC record is created for that customer if one does not already exist. Changing `bankName`, `accountNumber`, or `ifscCode` sets an existing KYC `bankAccount.status` back to `PENDING`.

`Content-Type: multipart/form-data`

| Field | Type | Rule |
| --- | --- | --- |
| `name` | string | 2 to 80 characters |
| `email` | string | Valid email, or empty to clear |
| `phone` | string | 10 digits, starting with `6`–`9`. Must be unique |
| `photo` | file | jpeg, png, or webp. Max 5 MB |
| `joiningDate` | date | Valid date |
| `fathersName` | string | 2 to 80 characters, or empty to clear |
| `dob` | date | Valid date, or empty to clear |
| `address` | string | 5 to 300 characters, or empty to clear |
| `pinCode` | string | 6 digits, or empty to clear |
| `aadhar` | string | 12 digits, or empty to clear |
| `aadharDocument` | file | jpeg, png, webp, or pdf. Max 5 MB |
| `pan` | string | 10 letters or digits, or empty to clear |
| `panDocument` | file | jpeg, png, webp, or pdf. Max 5 MB |
| `nominee` | string | 2 to 80 characters, or empty to clear |
| `nomineeRelation` | string | 2 to 40 characters, or empty to clear |
| `bankName` | string | 2 to 80 characters, or empty to clear |
| `accountNumber` | string | 9 to 18 digits, or empty to clear |
| `ifscCode` | string | Valid IFSC, or empty to clear |

### Success `200`

Same `data` shape as get profile. Message is `Profile updated successfully`.

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `400` | At least one field is required |
| `400` | Invalid file type |
| `401` | Invalid customer session |
| `404` | Customer not found |
| `409` | Phone number already exists |

---

## 8. Delete account

`DELETE /api/v1/customer/profile`

Deletes the customer in the access token, plus that customer's KYC, interest record, login OTPs, and uploaded photo, Aadhaar, and PAN files.

### Success `200`

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60710"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 9. Get bank details

`GET /api/v1/customer/bank`

Returns the customer's one bank account. `bankName`, `accountNumber`, and `ifscCode` are `null` when none is saved.

### Success `200`

```json
{
  "success": true,
  "message": "Bank details fetched successfully",
  "data": {
    "bankName": "State Bank of India",
    "accountNumber": "123456789012",
    "ifscCode": "SBIN0001234"
  }
}
```

`data` is three `null` fields when the customer has no bank account.

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 10. Save bank details

`POST /api/v1/customer/bank`

All three fields are required. Fails when a bank account is already saved.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `bankName` | string | yes. 2 to 80 characters |
| `accountNumber` | string | yes. 9 to 18 digits |
| `ifscCode` | string | yes. Valid IFSC |

```json
{
  "bankName": "State Bank of India",
  "accountNumber": "123456789012",
  "ifscCode": "SBIN0001234"
}
```

### Success `201`

```json
{
  "success": true,
  "message": "Bank details saved successfully",
  "data": {
    "bankName": "State Bank of India",
    "accountNumber": "123456789012",
    "ifscCode": "SBIN0001234"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `401` | Invalid customer session |
| `404` | Customer not found |
| `409` | Bank details already exist |

---

## 11. Update bank details

`PATCH /api/v1/customer/bank`

Updates the customer's single bank account. Send at least one of `bankName`, `accountNumber`, or `ifscCode`. If a KYC record exists, `bankAccount.status` returns to `PENDING`.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `bankName` | string | no |
| `accountNumber` | string | no |
| `ifscCode` | string | no |

```json
{
  "bankName": "SBI",
  "accountNumber": "888888888",
  "ifscCode": "HDFC0000124"
}
```

### Success `200`

```json
{
  "success": true,
  "message": "Bank details updated successfully",
  "data": {
    "bankName": "SBI",
    "accountNumber": "888888888",
    "ifscCode": "HDFC0000124"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `401` | Invalid customer session |
| `404` | Customer not found |
| `404` | Bank details not found |

---

## 12. Clear bank details

`DELETE /api/v1/customer/bank`

Clears the customer's `bankName`, `accountNumber`, and `ifscCode`.

### Success `200`

```json
{
  "success": true,
  "message": "Bank details deleted successfully",
  "data": {
    "bankName": null,
    "accountNumber": null,
    "ifscCode": null
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |
| `404` | Customer not found |
| `404` | Bank details not found |

---

## 13. Dashboard

`GET /api/v1/customer/dashboard`

`totalSaving` adds `PENDING`, `PROCESSING`, and `COMPLETED` `SAVING` transactions. `monthlySaving` is that amount for the current month, India time. `FAILED` and `REVERSED` are left out. `transactions` contains at most the latest 4 transactions.

### Success `200`

```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "monthlySaving": 2000,
    "totalSaving": 15000,
    "transactions": [
      {
        "id": "6741a0c2e1b2c3d4e5f60740",
        "transactionId": "TXN123456",
        "type": "SAVING",
        "amount": 2000,
        "currency": "INR",
        "status": "COMPLETED",
        "paymentType": "UPI",
        "failureReason": null,
        "completedAt": "2026-11-01T04:30:00.000Z",
        "createdAt": "2026-11-01T04:30:00.000Z"
      }
    ]
  }
}
```

Transaction `type` is `SAVING` or `WITHDRAWAL`.

`status` is `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, or `REVERSED`.

`paymentType` is `UPI`, `BANK`, `CARD`, or `NETBANKING`.

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 14. Send a saving

`POST /api/v1/customer/transactions/saving`

Creates a pending `SAVING` transaction. Do not send `type`.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `amount` | number | yes. At least 1 |
| `paymentType` | string | no. `UPI`, `BANK`, `CARD`, or `NETBANKING`. Default `BANK` |

```json
{
  "amount": 1000
}
```

### Success `201`

```json
{
  "success": true,
  "message": "Amount sent successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60740",
    "transactionId": "TXN1732368000AB12CD",
    "type": "SAVING",
    "amount": 1000,
    "currency": "INR",
    "status": "PENDING",
    "paymentType": "BANK",
    "failureReason": null,
    "completedAt": null,
    "createdAt": "2026-11-23T12:00:00.000Z"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 15. Withdraw an amount

`POST /api/v1/customer/transactions/withdrawal`

Creates a pending `WITHDRAWAL` transaction. Do not send `type`. The customer's KYC `status` must be `VERIFIED`.

### Body

| Field | Type | Required |
| --- | --- | --- |
| `amount` | number | yes. At least 1 |
| `paymentType` | string | no. `UPI`, `BANK`, `CARD`, or `NETBANKING`. Default `BANK` |

```json
{
  "amount": 1000
}
```

### Success `201`

```json
{
  "success": true,
  "message": "Amount sent successfully",
  "data": {
    "id": "6741a0c2e1b2c3d4e5f60740",
    "transactionId": "TXN1732368000AB12CD",
    "type": "WITHDRAWAL",
    "amount": 1000,
    "currency": "INR",
    "status": "PENDING",
    "paymentType": "BANK",
    "failureReason": null,
    "completedAt": null,
    "createdAt": "2026-11-23T12:00:00.000Z"
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `400` | Validation failed |
| `401` | Invalid customer session |
| `403` | First verify your KYC |
| `404` | Customer not found |

---

## 16. Transactions

`GET /api/v1/customer/transactions`

Returns every transaction for the logged-in customer, newest first.

`summary.totalSaved` and `summary.totalWithdrawn` add up `PENDING`, `PROCESSING`, and `COMPLETED` transactions. `FAILED` and `REVERSED` are left out. `summary.totalInterest` comes from the interest record, or `0` when none exists.

### Query

| Field | Type | Required |
| --- | --- | --- |
| `page` | integer | no. Default `1` |
| `limit` | integer | no. Default `10`. Maximum `50` |

### Success `200`

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": {
    "summary": {
      "totalSaved": 15000,
      "totalWithdrawn": 3000,
      "totalInterest": 450
    },
    "transactions": [
      {
        "id": "6741a0c2e1b2c3d4e5f60740",
        "transactionId": "TXN123456",
        "type": "SAVING",
        "amount": 2000,
        "currency": "INR",
        "status": "COMPLETED",
        "paymentType": "UPI",
        "failureReason": null,
        "completedAt": "2026-11-01T04:30:00.000Z",
        "createdAt": "2026-11-01T04:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 24,
      "totalPages": 3
    }
  }
}
```

### Errors

| Status | Message |
| --- | --- |
| `401` | Invalid customer session |
| `404` | Customer not found |

---

## 17. Active plans

`GET /api/v1/customer/plans`

Returns every plan with `isActive: true`. `total` is how many active plans exist.

### Success `200`

```json
{
  "success": true,
  "message": "Plans fetched successfully",
  "data": {
    "total": 1,
    "plans": [
      {
        "id": "6741a0c2e1b2c3d4e5f60750",
        "schemeName": "Monthly Savings",
        "planType": "Saving",
        "minimumInvestmentAmount": 1000,
        "payout": 12,
        "monthlyInterest": 1.5,
        "monthlyInterestDate": "2026-11-05T00:00:00.000Z",
        "planRules": [
          {
            "ruleName": "Lock-in",
            "description": "Amount stays invested for 12 months"
          }
        ],
        "isActive": true
      }
    ]
  }
}
```

`plans` is an empty array and `total` is `0` when no active plan exists.
