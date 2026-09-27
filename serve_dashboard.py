from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import socket


HOST = "127.0.0.1"
PORT = 8080
FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"


class FrontendHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)


def find_open_port(host, preferred_port):
    for port in (preferred_port, 8000, 3000, 5000, 5500, 8888, 9000, 0):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return sock.getsockname()[1]
    raise OSError("No open local port was available.")


def main():
    if not FRONTEND_DIR.exists():
        raise SystemExit(f"Frontend directory not found: {FRONTEND_DIR}")

    os.chdir(FRONTEND_DIR)
    port = find_open_port(HOST, PORT)
    server = ThreadingHTTPServer((HOST, port), FrontendHandler)
    print(f"Serving dashboard from: {FRONTEND_DIR}")
    print(f"Open: http://{HOST}:{port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down dashboard server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
