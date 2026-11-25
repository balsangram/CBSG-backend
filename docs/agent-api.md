# Agent API

Base path: `/api/v1/agent`

An agent is an executive manager or a team lead. These routes are for the logged-in agent: their own dashboard, profile, incentive, and the customers they manage.

Every route needs `Authorization: Bearer <accessToken>`. The token must belong to an agent. Customer and admin tokens receive `403`.

**8 APIs are live.**

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
  "message": "Agent access required"
}
```

## Dashboard, profile, and incentive

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/agent/manager/dashboard` | Home screen for the logged-in agent. Returns photo, employee id, branch name, level from the agent's target, total incentive earned, total customers, total amount those customers have paid, and up to 4 customers who paid today. |
| `GET` | `/api/v1/agent/manager/profile` | Full profile: name, email, phone, photo, role, branch, level, target, total customers, and total savings. |
| `GET` | `/api/v1/agent/manager/Incentive` | Incentive for the last 6 months. Each month has a name and an amount, plus the total of those months. |

The level on the dashboard and profile is the agent's target (`targetId`). If none is assigned, the active target for that role is used.

`incentive` on the dashboard is the total incentive this agent has earned. A customer's manager receives 10% of each saving. The team lead on `teamLeadId` receives 5% when one is assigned.

## Customers

The agent id is taken from the access token. It is not sent in the body.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/agent/customers` | List customers, newest first. `page` defaults to 1. `limit` defaults to 10 and cannot be more than 50. |
| `POST` | `/api/v1/agent/customers` | Create a customer for the logged-in agent. `name`, `phone`, and `address` are required. Photo, Aadhaar document, and PAN document are file uploads. |
| `GET` | `/api/v1/agent/customers/:id` | One customer. `totalDays` is the number of days from the joining date through today. `totalSaved` is the sum of saving transactions only. Withdrawals are not included. |
| `PATCH` | `/api/v1/agent/customers/:id` | Update that customer. The same fields as create can be sent. |
| `DELETE` | `/api/v1/agent/customers/:id` | Delete that customer. |

## Not connected

These files exist, but `src/modules/agent/routes/agent.routes.js` does not mount them, so they do not respond.

| File | What it would do |
|---|---|
| `notification.router.js` | `GET /agent/notifications`. Manager notifications for `executive_manager`, team-lead notifications for `team_lead`. 15 per page. |
| `team-lead.routes.js` | Commented out in `agent.routes.js`. The file also has no router setup, so it cannot be mounted as it is. |
