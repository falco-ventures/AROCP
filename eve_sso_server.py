#!/usr/bin/env python3
import json, urllib.parse, urllib.request, ssl
from http.server import BaseHTTPRequestHandler, HTTPServer

CLIENT_ID     = "5fe7b21736e748c6a78d9e4f98ff536e"
CLIENT_SECRET = "5e0tEfn1tNwFPvEz4EEcXcJIpSngdGQBc3cbdOgU"

TOKEN_URL = "https://login.eveonline.com/v2/oauth/token"
VERIFY_URL = "https://login.eveonline.com/oauth/verify"

ALLOWED_ORIGIN = "https://falco-ventures.github.io"

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_headers()
        self.end_headers()

    def do_GET(self):
        if not self.path.startswith("/eve/token"):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error":"not_found"}')
            return

        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        code = params.get("code", [None])[0]

        if not code:
            self.send_response(400)
            self._set_headers()
            self.end_headers()
            self.wfile.write(b'{"error":"missing_code"}')
            return

        # Exchange authorization code for access token
        data = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "code": code,
        }).encode()

        auth_header = f"{CLIENT_ID}:{CLIENT_SECRET}".encode()
        auth_value = "Basic " + ssl._base64encode(auth_header).decode()

        req = urllib.request.Request(TOKEN_URL, data=data)
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        req.add_header("Authorization", auth_value)

        try:
            resp = urllib.request.urlopen(req)
            token_data = json.loads(resp.read())
        except Exception as e:
            self.send_response(500)
            self._set_headers()
            self.end_headers()
            self.wfile.write(b'{"error":"token_exchange_failed"}')
            return

        # Now call VERIFY
        verify_req = urllib.request.Request(VERIFY_URL)
        verify_req.add_header("Authorization", "Bearer " + token_data["access_token"])

        try:
            verify_resp = urllib.request.urlopen(verify_req)
            verify_data = json.loads(verify_resp.read())
        except:
            verify_data = {"error": "verify_failed"}

        # Return combined payload
        output = {
            "token": token_data,
            "verify": verify_data
        }

        self.send_response(200)
        self._set_headers()
        self.end_headers()
        self.wfile.write(json.dumps(output).encode())


def run():
    httpd = HTTPServer(("localhost", 8000), Handler)

    # Load SSL certs
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        keyfile="key.pem",
        certfile="cert.pem",
        server_side=True,
    )

    print("HTTPS Eve SSO helper running at https://localhost:8000/eve/token")
    httpd.serve_forever()

run()
