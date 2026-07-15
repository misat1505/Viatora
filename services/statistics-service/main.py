import asyncio
import threading

from generated import stats_pb2_grpc
from grpc import aio
from utils.di import Container
from utils.settings import settings


async def serve():
    container = Container()

    threading.Thread(
        target=container.exam_consumer,
        daemon=True,
    ).start()

    server = aio.server()

    stats_pb2_grpc.add_StatsServiceServicer_to_server(
        container.stats_servicer(),
        server,
    )

    server.add_insecure_port(f"[::]:{settings.grpc_port}")

    await server.start()

    logger = container.logger()
    logger.info("Auth gRPC server started on port %s", settings.grpc_port)

    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
