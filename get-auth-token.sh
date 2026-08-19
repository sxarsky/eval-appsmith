#!/usr/bin/env bash
# Get an Appsmith session auth token for eval use.
#
# Creates the first admin user if not already created, then logs in and
# returns SESSION=<cookie_value> — the full Cookie header value to set as
# SKYRAMP_TEST_TOKEN. The Skyramp Java client will send: Cookie: $SKYRAMP_TEST_TOKEN
#
# Usage: SKYRAMP_TEST_TOKEN=$(bash get-auth-token.sh)
set -euo pipefail

APPSMITH_HOST="${APPSMITH_HOST:-http://localhost:8080}"
# Credentials come from scenario.json `uiCredentials` via start-services.sh.
# This keeps scenario.json as the single source of truth — the same user
# provisioned here is the one the testbot agent logs in as via the browser.
ADMIN_EMAIL="${SKYRAMP_UI_USERNAME:-${APPSMITH_ADMIN_EMAIL:-}}"
ADMIN_PASSWORD="${SKYRAMP_UI_PASSWORD:-${APPSMITH_ADMIN_PASSWORD:-}}"
ADMIN_NAME="Eval Admin"

if [[ -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" ]]; then
  echo "ERROR: SKYRAMP_UI_USERNAME/SKYRAMP_UI_PASSWORD not set." >&2
  echo "       Set scenario.json 'uiCredentials' (format: 'user:password') — " >&2
  echo "       start-services.sh propagates it to this script as env vars." >&2
  exit 1
fi

# Appsmith requires XSRF protection on mutating requests.
# Fetch an XSRF token from the health endpoint, then pass it as both a
# cookie and the X-XSRF-TOKEN header. Origin is also required.
XSRF_COOKIE=$(curl -sfi "${APPSMITH_HOST}/api/v1/health" \
  | grep -i '^set-cookie:' \
  | grep -oi 'XSRF-TOKEN=[^;]*' \
  | head -1)
XSRF_VALUE="${XSRF_COOKIE#XSRF-TOKEN=}"

if [[ -z "${XSRF_COOKIE}" || -z "${XSRF_VALUE}" ]]; then
  echo "ERROR: could not obtain Appsmith XSRF token from ${APPSMITH_HOST}/api/v1/health" >&2
  exit 1
fi

# Create the first superuser. Treat redirect (302) and "already initialized"
# responses as success; fail loudly for unexpected HTTP or network errors.
# Uses form-urlencoded (the /super endpoint rejects application/json).
SUPERUSER_RESPONSE_BODY=$(mktemp)
trap 'rm -f "${SUPERUSER_RESPONSE_BODY}"' EXIT
SUPERUSER_STATUS=$(
  curl -sS -o "${SUPERUSER_RESPONSE_BODY}" -w '%{http_code}' -X POST "${APPSMITH_HOST}/api/v1/users/super" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "X-XSRF-TOKEN: ${XSRF_VALUE}" \
    -H "Cookie: ${XSRF_COOKIE}" \
    -H "Origin: ${APPSMITH_HOST}" \
    --data-urlencode "name=${ADMIN_NAME}" \
    --data-urlencode "email=${ADMIN_EMAIL}" \
    --data-urlencode "password=${ADMIN_PASSWORD}" \
    --data-urlencode "allowCollectingAnonymousData=false" \
    --data-urlencode "signupForNewsletter=false"
) || { echo "ERROR: network failure contacting ${APPSMITH_HOST}/api/v1/users/super" >&2; exit 1; }

case "${SUPERUSER_STATUS}" in
  2??|302) ;;
  400|409)
    if ! grep -qiE 'already|initialized|exists' "${SUPERUSER_RESPONSE_BODY}"; then
      echo "ERROR: unexpected response while creating Appsmith superuser (HTTP ${SUPERUSER_STATUS})" >&2
      cat "${SUPERUSER_RESPONSE_BODY}" >&2
      exit 1
    fi
    ;;
  *)
    echo "ERROR: failed to create Appsmith superuser (HTTP ${SUPERUSER_STATUS})" >&2
    cat "${SUPERUSER_RESPONSE_BODY}" >&2
    exit 1
    ;;
esac

# Log in and capture the SESSION cookie
SESSION_VALUE=$(
  curl -si -X POST "${APPSMITH_HOST}/api/v1/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "X-XSRF-TOKEN: ${XSRF_VALUE}" \
    -H "Cookie: ${XSRF_COOKIE}" \
    -H "Origin: ${APPSMITH_HOST}" \
    --data-urlencode "username=${ADMIN_EMAIL}" \
    --data-urlencode "password=${ADMIN_PASSWORD}" \
  | grep -i '^set-cookie:' \
  | grep -oi 'SESSION=[^;]*' \
  | head -1
)

if [[ -z "$SESSION_VALUE" ]]; then
  echo "ERROR: could not obtain Appsmith session cookie — login failed" >&2
  exit 1
fi

# Output the full cookie header value (SESSION=<token>)
# The Skyramp client replaces SKYRAMP_PLACEHOLDER_TOKEN with this value
# and sends: Cookie: SESSION=<token>
echo "$SESSION_VALUE"
