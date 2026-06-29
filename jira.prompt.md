# JIRA Ticket Reader

Fetch and parse a JIRA ticket using the JIRA REST API with Personal Access Token (PAT) authentication.

## Prerequisites

Create a `settings.local.json` file at the workspace root:

```json
{
  "jira": {
    "baseUrl": "https://yourcompany.atlassian.net",
    "pat": "ATATT3xFfGF0..."
  }
}
```

Generate a PAT at: JIRA → Profile → Personal Access Tokens → Create token

**Fallback:** If `settings.local.json` is missing, uses `JIRA_BASE_URL` and `JIRA_PAT` environment variables.

## Read config

```bash
baseUrl=$(jq -r '.jira.baseUrl' settings.local.json)
pat=$(jq -r '.jira.pat' settings.local.json)
```

## Fetch a ticket

```bash
baseUrl=$(jq -r '.jira.baseUrl' settings.local.json)
pat=$(jq -r '.jira.pat' settings.local.json)

curl -s -X GET \
  "$baseUrl/rest/api/3/issue/PROJ-123" \
  -H "Authorization: Bearer $pat" \
  -H "Accept: application/json"
```

## Key fields

| Field | Path |
|---|---|
| Key | `.key` |
| Summary | `.fields.summary` |
| Description | `.fields.description` (ADF format — parse to text) |
| Status | `.fields.status.name` |
| Type | `.fields.issuetype.name` |
| Priority | `.fields.priority.name` |
| Assignee | `.fields.assignee.displayName` |
| Labels | `.fields.labels` |
| Components | `.fields.components[].name` |
| Acceptance Criteria | `.fields.customfield_10001` (field ID varies by instance) |
| Story Points | `.fields.customfield_10002` (field ID varies by instance) |

> Custom field IDs vary by JIRA instance. Run `GET /rest/api/3/field` to find yours.

## Parse ADF to plain text

JIRA v3 stores rich text in Atlassian Document Format (ADF). To extract plain text:

```bash
echo "$response" | jq -r '
  [paths(type == "text") | . as $p | get($p | .[:-1]) | .text // empty] | join("")
'
```

## Search with JQL

```bash
baseUrl=$(jq -r '.jira.baseUrl' settings.local.json)
pat=$(jq -r '.jira.pat' settings.local.json)

curl -s -X GET \
  "$baseUrl/rest/api/3/search?jql=project=PROJ+AND+sprint+in+openSprints()+AND+status!=Done&maxResults=10" \
  -H "Authorization: Bearer $pat" \
  -H "Accept: application/json"
```

## Errors

| Status | Cause | Solution |
|---|---|---|
| 401 | Invalid/expired PAT | Generate new PAT |
| 403 | Insufficient permissions | Ensure PAT has Read access |
| 404 | Issue not found | Check key and access |
| 429 | Rate limited | Wait and retry (~100 req/min) |
