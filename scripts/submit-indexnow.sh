#!/usr/bin/env bash

set -euo pipefail

site_url="https://lchaimlyrics.com"
site_host="lchaimlyrics.com"
indexnow_key="${1:-}"
key_location="${site_url}/${indexnow_key}.txt"
indexnow_endpoint="https://www.bing.com/indexnow"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sitemap_file="${repo_root}/sitemap.xml"

if [[ ! "${indexnow_key}" =~ ^[A-Za-z0-9-]{8,128}$ ]]; then
    echo "A valid IndexNow key is required."
    exit 1
fi

payload_file="$(mktemp)"
response_file="$(mktemp)"
key_verification_file="$(mktemp)"
trap 'rm -f "${payload_file}" "${response_file}" "${key_verification_file}"' EXIT

if ! curl --silent --show-error --fail \
    --retry 6 \
    --retry-delay 5 \
    --retry-all-errors \
    --output "${key_verification_file}" \
    "${key_location}" ||
    ! grep --fixed-strings --line-regexp --quiet \
        "${indexnow_key}" "${key_verification_file}"; then
    echo "The IndexNow key file is not available at ${key_location}."
    exit 1
fi

sed -n 's|.*<loc>\(https://lchaimlyrics\.com[^<]*\)</loc>.*|\1|p' "${sitemap_file}" |
    jq --raw-input --slurp \
        --arg host "${site_host}" \
        --arg key "${indexnow_key}" \
        --arg keyLocation "${key_location}" \
        '{
            host: $host,
            key: $key,
            keyLocation: $keyLocation,
            urlList: (split("\n") | map(select(length > 0)))
        }' > "${payload_file}"

url_count="$(jq '.urlList | length' "${payload_file}")"
if [[ "${url_count}" -eq 0 ]]; then
    echo "No URLs were found in ${sitemap_file}."
    exit 1
fi

http_status="$(
    curl --silent --show-error \
        --output "${response_file}" \
        --write-out '%{http_code}' \
        --header 'Content-Type: application/json; charset=utf-8' \
        --data-binary "@${payload_file}" \
        "${indexnow_endpoint}"
)"

if [[ "${http_status}" != "200" && "${http_status}" != "202" ]]; then
    echo "IndexNow returned HTTP ${http_status}."
    cat "${response_file}"
    exit 1
fi

echo "Submitted ${url_count} URLs to IndexNow (HTTP ${http_status})."
