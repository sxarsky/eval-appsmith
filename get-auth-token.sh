#!/usr/bin/env bash
# Get an Appsmith session auth token for eval use.
#
# Creates the first admin user if not already created, then returns
# SESSION=<cookie_value> — the full Cookie header value to set as
# SKYRAMP_TEST_TOKEN. The Skyramp Java client will send: Cookie: $SKYRAMP_TEST_TOKEN
#
# Usage: SKYRAMP_TEST_TOKEN=$(bash get-auth-token.sh)
set -euo pipefail

APPSMITH_HOST="${APPSMITH_HOST:-http://localhost:8080}"
ADMIN_EMAIL="${SKYRAMP_UI_USERNAME:-${APPSMITH_ADMIN_EMAIL:-admin@example.com}}"
ADMIN_PASSWORD="${SKYRAMP_UI_PASSWORD:-${APPSMITH_ADMIN_PASSWORD:-Eval@dmin1!}}"
ADMIN_NAME="Eval Admin"

if [[ -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" ]]; then
  echo "ERROR: SKYRAMP_UI_USERNAME/SKYRAMP_UI_PASSWORD not set." >&2
  exit 1
fi

# /api/v1/users/me goes through Spring Security's CSRF filter and reliably sets
# XSRF-TOKEN even on a 401 response. Use -si (not -sfi) so curl doesn't fail on 401.
# || true prevents set -euo pipefail from killing the script on grep no-match.
XSRF_COOKIE=$(curl -si "${APPSMITH_HOST}/api/v1/users/me" \
  | grep -i '^set-cookie:' \
  | grep -oi 'XSRF-TOKEN=[^;]*' \
  | head -1 || true)
XSRF_VALUE="${XSRF_COOKIE#XSRF-TOKEN=}"

if [[ -z "${XSRF_COOKIE}" || -z "${XSRF_VALUE}" ]]; then
  echo "ERROR: could not obtain Appsmith XSRF token from ${APPSMITH_HOST}/api/v1/users/me" >&2
  exit 1
fi

# Create the first superuser.
# The /super endpoint calls signupAndLogin internally — on success it logs the user in
# and the SESSION cookie is set directly in the 302 response headers. Capture those
# headers with -D so we can extract the SESSION cookie without a separate login step.
SUPERUSER_BODY=$(mktemp)
SUPERUSER_HEADERS=$(mktemp)
trap 'rm -f "${SUPERUSER_BODY}" "${SUPERUSER_HEADERS}"' EXIT

SUPERUSER_STATUS=$(
  curl -sS -D "${SUPERUSER_HEADERS}" -o "${SUPERUSER_BODY}" -w '%{http_code}' \
    -X POST "${APPSMITH_HOST}/api/v1/users/super" \
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

echo "DEBUG superuser HTTP ${SUPERUSER_STATUS}, Location: $(grep -i '^Location:' "${SUPERUSER_HEADERS}" || true)" >&2

case "${SUPERUSER_STATUS}" in
  2??|302) ;;
  400|409)
    if ! grep -qiE 'already|initialized|exists' "${SUPERUSER_BODY}"; then
      echo "ERROR: unexpected superuser creation response (HTTP ${SUPERUSER_STATUS})" >&2
      cat "${SUPERUSER_BODY}" >&2
      exit 1
    fi
    ;;
  *)
    echo "ERROR: failed to create Appsmith superuser (HTTP ${SUPERUSER_STATUS})" >&2
    cat "${SUPERUSER_BODY}" >&2
    exit 1
    ;;
esac

# The /super endpoint logs the user in as part of signup — try to get SESSION from
# the superuser creation response headers first, before attempting a separate login.
SESSION_VALUE=$(grep -i '^set-cookie:' "${SUPERUSER_HEADERS}" \
  | grep -oi 'SESSION=[^;]*' \
  | head -1 || true)

if [[ -n "$SESSION_VALUE" ]]; then
  echo "DEBUG: SESSION obtained from superuser creation response" >&2
  echo "$SESSION_VALUE"
  exit 0
fi

echo "DEBUG: SESSION not in superuser response, attempting separate login" >&2

# Fallback: explicit login with the credentials just created.
LOGIN_RESPONSE=$(curl -si -X POST "${APPSMITH_HOST}/api/v1/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "X-XSRF-TOKEN: ${XSRF_VALUE}" \
    -H "Cookie: ${XSRF_COOKIE}" \
    -H "Origin: ${APPSMITH_HOST}" \
    --data-urlencode "username=${ADMIN_EMAIL}" \
    --data-urlencode "password=${ADMIN_PASSWORD}" || true)

echo "DEBUG login response (first 20 lines):" >&2
echo "$LOGIN_RESPONSE" | head -20 >&2

SESSION_VALUE=$(echo "$LOGIN_RESPONSE" \
  | grep -i '^set-cookie:' \
  | grep -oi 'SESSION=[^;]*' \
  | head -1 || true)

if [[ -z "$SESSION_VALUE" ]]; then
  echo "ERROR: could not obtain Appsmith SESSION cookie — login failed" >&2
  exit 1
fi

echo "$SESSION_VALUE"
