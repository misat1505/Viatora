import re
from pathlib import Path

grpc_files = [
    Path("./generated/auth_pb2_grpc.py"),
    Path("./generated/stats_pb2_grpc.py"),
]

for grpc_file in grpc_files:
    content = grpc_file.read_text()
    content = re.sub(
        r"^import (\w+_pb2)", r"import generated.\1", content, flags=re.MULTILINE
    )
    grpc_file.write_text(content)
