import re
from pathlib import Path

grpc_file = Path("./generated/auth_pb2_grpc.py")
content = grpc_file.read_text()
content = re.sub(
    r"^import (\w+_pb2)", r"import generated.\1", content, flags=re.MULTILINE
)
grpc_file.write_text(content)
