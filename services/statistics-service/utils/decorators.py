import inspect
import json

from pydantic import BaseModel
from utils.config import create_kafka_consumer


def TopicHandler(topic: str):
    def decorator(func):

        func._kafka_topic = topic

        return func

    return decorator


def ValidatePayload(model: type[BaseModel]):
    def decorator(func):

        def wrapper(self, data: dict):

            validated_payload = model.model_validate(data)

            return func(self, validated_payload)

        return wrapper

    return decorator


def KafkaConsumer(cls):

    original_init = cls.__init__

    def init_wrapper(self, *args, **kwargs):
        original_init(self, *args, **kwargs)

        self._consumer = create_kafka_consumer()
        self.endpoints = {}

        for _, method in inspect.getmembers(self, predicate=inspect.ismethod):
            topic = getattr(method, "_kafka_topic", None)
            if topic:
                self.endpoints[topic] = method

        self.start()

    cls.__init__ = init_wrapper

    def start(self):
        topics = list(self.endpoints.keys())
        self._consumer.subscribe(topics)

        print(f"Kafka listening: {topics}")

        while True:
            msg = self._consumer.poll(1.0)
            if msg is None:
                continue

            if msg.error():
                print(msg.error())
                continue

            topic = msg.topic()
            payload = json.loads(msg.value().decode("utf-8"))

            handler = self.endpoints.get(topic)
            if handler:
                handler(payload)

            self._consumer.commit(msg)

    cls.start = start

    return cls
