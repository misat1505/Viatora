from confluent_kafka import Consumer


def create_kafka_consumer():

    config = {
        "bootstrap.servers": "localhost:29092",
        "group.id": "statistics-service",
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
    }

    return Consumer(config)
