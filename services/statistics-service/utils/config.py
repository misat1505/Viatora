from confluent_kafka import Consumer
from utils.settings import Settings


def create_kafka_consumer(settings: Settings) -> Consumer:
    config = {
        "bootstrap.servers": f"{settings.kafka_host}:{settings.kafka_port}",
        "group.id": settings.kafka_group_id,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
    }

    return Consumer(config)
