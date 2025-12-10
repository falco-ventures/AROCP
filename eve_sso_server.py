#!/usr/bin/env python3
import base64
import os
from flask import Flask, request, jsonify, make_response
import requests

app = Flask(__name__)

# ==== CONFIG ====
# In production, override these with environment variables:
CLIENT_ID = os.environ.get("EVE_CLIENT_ID", "5fe7b21736e748c6a78d9e4f98ff536e")
CLIENT_SECRET = os.environ.get("EVE_CLIENT_SECRET", "5e0tEfn1tNwFPvEz4EEcXcJIpSngdGQBc3cbdOgU")
REDIRECT_URI = os.environ.get(
    "EVE_REDIRECT_URI",
    "https://localhost:8000/AROCP/map/index.html"
)

TOKEN_URL = "https://login.eveonline.com/v2/oauth/token"
VERIFY_URL = "https://login.eveonline.com/oauth/verify"

# ============ CORS ============

ALLOWED_ORIGIN = os.environ.get(
    "ALLOWED_ORIGIN",
    "https://falco-ventures.github.io"
)

from flask import send_from_directory

@app.route("/")
def root():
    return "EVE SSO helper is running."

@app.route("/AROCP/<path:path>")
def public_files(path):
    return send_from_directory("public", path)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/eve/token", methods=["GET", "POST", "OPTIONS"])
def eve_token():
    # Handle preflight
    if request.method == "OPTIONS":
        return make_response("", 204)

    # Get ?code=... from query or JSON
    code = request.args.get("code")
    if not code and request.is_json:
        code = (request.get_json() or {}).get("code")

    if not code:
        return jsonify({"error": "missing_code", "error_description": "No 'code' parameter provided"}), 400

    if not CLIENT_ID or not CLIENT_SECRET:
        return jsonify({"error": "server_misconfigured", "error_description": "Missing client credentials"}), 500

    # Basic auth header: Base64(client_id:client_secret)
    auth_bytes = f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
    auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")

    # Form-encoded body per EVE SSO docs
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }

    headers = {
        "Authorization": f"Basic {auth_b64}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    # ---- Step 1: exchange code for token ----
    try:
        token_resp = requests.post(TOKEN_URL, data=data, headers=headers, timeout=10)
    except Exception as e:
        return jsonify({"error": "token_request_failed", "error_description": str(e)}), 502

    # If CCP returns HTML error page / 500, forward status + minimal info
    content_type = token_resp.headers.get("Content-Type", "")
    if "application/json" in content_type.lower():
        token_json = token_resp.json()
    else:
        # Not JSON (likely HTML error), wrap it
        token_json = {
            "raw_body": token_resp.text[:1000]  # truncate
        }

    if not token_resp.ok:
        return jsonify({
            "error": "eve_sso_error",
            "status": token_resp.status_code,
            "token_response": token_json,
        }), token_resp.status_code

    # ---- Step 2: verify token -> character info ----
    access_token = token_json.get("access_token")
    verify_json = None

    if access_token:
        try:
            verify_resp = requests.get(
                VERIFY_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            if "application/json" in verify_resp.headers.get("Content-Type", "").lower():
                verify_json = verify_resp.json()
            else:
                verify_json = {"raw_body": verify_resp.text[:1000]}

        except Exception as e:
            verify_json = {"error": "verify_request_failed", "error_description": str(e)}

    result = {
        "token": token_json,
        "verify": verify_json,
    }

    return jsonify(result), 200


if __name__ == "__main__":
    # Bind to 0.0.0.0 so it's reachable from outside in most hosting setups
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting EVE SSO helper server on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
