import subprocess
import sys

from watchfiles import watch


def main() -> None:
    process = subprocess.Popen([sys.executable, "main.py"])
    print("Started main.py...")

    try:
        for _ in watch(".", watch_filter=lambda change, path: path.endswith(".py")):
            print("Change detected, restarting...")
            process.terminate()
            process.wait()
            process = subprocess.Popen([sys.executable, "main.py"])
            print("Restarted main.py")
    except KeyboardInterrupt:
        print("Stopping dev mode...")
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        print("Dev mode stopped cleanly")


if __name__ == "__main__":
    main()
