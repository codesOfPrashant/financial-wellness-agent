#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${LLM_WRAPPER_URL:-https://llm-wrapper-741152993481.asia-south1.run.app}"
TOKEN="${LLM_WRAPPER_API_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Set LLM_WRAPPER_API_TOKEN first."
  exit 1
fi

curl -sS -X POST "${BASE_URL}/llm/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"prompt":"Reply with exactly: OK","metadata":{"client":"financial-wellness-agent"}}' \
  | head -c 2000
echo ""
