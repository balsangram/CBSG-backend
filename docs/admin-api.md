# Admin API

Base path: `/api/v1/admin`

The admin panel manages agents, branches, customer KYC, and savings plans. Every route needs `Authorization: Bearer <accessToken>` for an admin. Agent and customer tokens receive `403`.

**19 APIs are live.**

## Response shape

Success:

```json
{
  "success": true,
  "message": "Agent list fetched successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Admin access required"
}
```

## Agents

Create and update an executive manager or a team lead. `name`, `email`, and `phone` are required on create. Photo is a file upload. `targetId` is the level goal for that agent. `teamLeadId` is optional and is the team lead a manager reports to.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/agents` | List agents. |
| `POST` | `/api/v1/admin/agents` | Create an agent. Role is `team_lead` or `executive_manager`. |
| `GET` | `/api/v1/admin/agents/:id` | One agent. |
| `PATCH` | `/api/v1/admin/agents/:id` | Update that agent. A photo can be sent alone. |
| `DELETE` | `/api/v1/admin/agents/:id` | Delete that agent. |

## Branches

A branch is a name and a city. Agents are assigned to a branch with `branchId`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/branches` | List branches. |
| `POST` | `/api/v1/admin/branches` | Create a branch. `name` and `city` are required. |
| `GET` | `/api/v1/admin/branches/:id` | One branch. |
| `PATCH` | `/api/v1/admin/branches/:id` | Update the name or city. |
| `DELETE` | `/api/v1/admin/branches/:id` | Delete that branch. |

## KYC

Review a customer's KYC. Sections are `personalDetails`, `address`, `aadhar`, `pan`, `photo`, `bankAccount`, and `nominee`. Approving or rejecting a section recalculates the overall KYC status.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/kyc` | List KYC records. Filter by `status`, search name, email, or phone, and page the result. Also returns counts per status. |
| `GET` | `/api/v1/admin/kyc/:customerId` | One customer's KYC, including every section. |
| `PATCH` | `/api/v1/admin/kyc/:customerId/sections/:section/approve` | Mark one section `VERIFIED`. |
| `PATCH` | `/api/v1/admin/kyc/:customerId/sections/:section/reject` | Mark one section `REJECTED`, with an optional reason and rejected fields. |
| `POST` | `/api/v1/admin/kyc/:customerId/reject` | Reject the whole KYC. `reason` is required. Every section becomes `REJECTED`. |

## Plans

A plan is a savings scheme: name, type, minimum amount, payout, monthly interest, rules, and whether it is a draft or published.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/plans` | List plans, including inactive ones. |
| `POST` | `/api/v1/admin/plans` | Create a plan. |
| `GET` | `/api/v1/admin/plans/:id` | One plan. |
| `PATCH` | `/api/v1/admin/plans/:id` | Update that plan. |

## Not connected

`src/modules/admin/routes/target.routes.js` is written, but `admin.routes.js` does not mount it, so these paths do not respond.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/targets` | List level targets, newest first. |
| `POST` | `/api/v1/admin/targets` | Create a target: name, savings amount, customer count, prize, level number such as `L1`, and role. |
| `PATCH` | `/api/v1/admin/targets/:id` | Update that target. |
| `DELETE` | `/api/v1/admin/targets/:id` | Delete that target. |
