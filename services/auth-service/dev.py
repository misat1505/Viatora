import subprocess
import sys

from watchfiles import watch


def main() -> None:
    process = subprocess.Popen([sys.executable, "main.py"])
    print("Started main.py...")

    for _ in watch(".", watch_filter=lambda change, path: path.endswith(".py")):
        print("Change detected, restarting...")
        process.terminate()
        process.wait()
        process = subprocess.Popen([sys.executable, "main.py"])
        print("Restarted main.py")


if __name__ == "__main__":
    main()
