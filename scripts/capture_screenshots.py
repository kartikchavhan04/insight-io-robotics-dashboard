import http.server
import socketserver
import threading
import time
import subprocess
import os

PORT = 4173
DIST_DIR = os.path.abspath('dist')
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOT_DIR = os.path.abspath('docs/screenshots')

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

def start_server():
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1)

def capture(url, output_path, window_size="1440,900"):
    full_output = os.path.join(SCREENSHOT_DIR, output_path)
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-software-rasterizer",
        f"--window-size={window_size}",
        f"--screenshot={full_output}",
        "--run-all-compositor-stages-before-draw",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(full_output) and os.path.getsize(full_output) > 0:
        print(f"Saved {output_path} ({os.path.getsize(full_output)} bytes)")
    else:
        print(f"Failed {output_path}: stdout={res.stdout}, stderr={res.stderr}")

capture(f"http://127.0.0.1:{PORT}", "01-dashboard-overview.png", "1440,900")
capture(f"http://127.0.0.1:{PORT}", "02-dashboard-tablet.png", "1024,768")
capture(f"http://127.0.0.1:{PORT}", "03-dashboard-mobile.png", "412,892")

