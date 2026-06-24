import asyncio
import logging

from config import settings
from database import Base, engine
from generated import auth_pb2_grpc
from grpc import aio
from grpc_server import AuthServicer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def serve() -> None:
    await create_tables()

    server = aio.server()
    auth_pb2_grpc.add_AuthServiceServicer_to_server(AuthServicer(), server)
    server.add_insecure_port(f"[::]:{settings.grpc_port}")

    await server.start()
    logger.info("Auth gRPC server started on port %s", settings.grpc_port)

    try:
        await server.wait_for_termination()
    finally:
        pass
        # await stop_producer()


if __name__ == "__main__":
    asyncio.run(serve())
