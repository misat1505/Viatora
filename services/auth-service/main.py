import asyncio

from config import settings
from database import Base, engine
from di import Container
from generated import auth_pb2_grpc
from grpc import aio
from interceptors.service_key_interceptor import ServiceKeyInterceptor


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def serve() -> None:
    container = Container(settings=settings)

    await create_tables()

    server = aio.server(interceptors=[ServiceKeyInterceptor(settings.service_key)])

    auth_pb2_grpc.add_AuthServiceServicer_to_server(
        container.auth_servicer(),
        server,
    )

    server.add_insecure_port(f"[::]:{settings.grpc_port}")

    await server.start()

    logger = container.logger()
    logger.info("Auth gRPC server started on port %s", settings.grpc_port)

    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
