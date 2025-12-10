#!/usr/bin/env python3
import base64
import os
import sys
from flask import Flask, request, jsonify, make_response
import requests

app = Flask(__name__)

# === CONFIG ===
CLIENT_ID = os.environ.get("EVE_CLIENT_ID", "5fe7b21736e748c6a78d9e4f98ff536e")
CLIENT_SECRET = os.environ.get("EVE_CLIENT_SECRET", "5e0tEfn1tNwFPvEz4EEcXcJIpSngdGQBc3cbdOgU")

TOKEN_URL = "https://login.eveonline.com/v2/oauth/token"
VERIFY_URL = "https://login.eveonline.com/oauth/verify"

ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "https://falco-ventures.github.io")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/")
def root():
    return "EVE SSO helper is running."


@app.route("/eve/token", methods=["GET", "POST", "OPTIONS"])
def eve_token():
    # Handle preflight
    if request.method == "OPTIONS":
        return make_response("", 204)

    # 1) Get code
    code = request.args.get("code")
    if not code and request.is_json:
        code = (request.get_json() or {}).get("code")

    if not code:
        return jsonify({"error": "missing_code", "error_description": "No 'code' parameter provided"}), 400

    if not CLIENT_ID or not CLIENT_SECRET:
        return jsonify({"error": "server_misconfigured", "error_description": "Missing client credentials"}), 500

    print(f"[eve/token] Received code: {code}", file=sys.stderr)

    # 2) Build Basic auth header
    auth_bytes = f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
    auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")

    # 3) Build form body EXACTLY as per SSO docs:
    #    grant_type=authorization_code&code=...   (no redirect_uri here)
    data = {
        "grant_type": "authorization_code",
        "code": code,
    }

    headers = {
        "Authorization": f"Basic {auth_b64}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    # 4) Exchange code -> token
    try:
        print(f"[eve/token] POST {TOKEN_URL}", file=sys.stderr)
        token_resp = requests.post(TOKEN_URL, data=data, headers=headers, timeout=10)
        print(f"[eve/token] CCP status: {token_resp.status_code}", file=sys.stderr)
        print(f"[eve/token] CCP raw body (truncated): {token_resp.text[:400]!r}", file=sys.stderr)
    except Exception as e:
        print(f"[eve/token] Exception talking to CCP: {e}", file=sys.stderr)
        return jsonify({"error": "token_request_failed", "error_description": str(e)}), 502

    content_type = token_resp.headers.get("Content-Type", "")
    if "application/json" in content_type.lower():
        try:
            token_json = token_resp.json()
        except Exception as e:
            token_json = {"json_parse_error": str(e), "raw_body": token_resp.text[:400]}
    else:
        token_json = {"raw_body": token_resp.text[:400]}

    # If CCP says error (400/401/500/etc), forward status and body
    if not token_resp.ok:
        return jsonify({
            "error": "eve_sso_error",
            "status": token_resp.status_code,
            "token_response": token_json,
        }), token_resp.status_code

    # 5) Verify the token to get character info
    access_token = token_json.get("access_token")
    verify_json = None

    if access_token:
        try:
            v_headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }
            print(f"[eve/token] GET {VERIFY_URL}", file=sys.stderr)
            verify_resp = requests.get(VERIFY_URL, headers=v_headers, timeout=10)
            print(f"[eve/token] VERIFY status: {verify_resp.status_code}", file=sys.stderr)
            print(f"[eve/token] VERIFY raw body (truncated): {verify_resp.text[:400]!r}", file=sys.stderr)

            if "application/json" in verify_resp.headers.get("Content-Type", "").lower():
                verify_json = verify_resp.json()
            else:
                verify_json = {"raw_body": verify_resp.text[:400]}
        except Exception as e:
            verify_json = {"error": "verify_request_failed", "error_description": str(e)}

    result = {
        "token": token_json,
        "verify": verify_json,
    }

    return jsonify(result), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting EVE SSO helper server on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
