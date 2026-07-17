import asyncio
import inspect
import json
from abc import ABC

from utils.config import create_kafka_consumer


class AsyncKafkaConsumer(ABC):
    def __init__(self):
        self._consumer = create_kafka_consumer()
        self._running = False
        self.endpoints = self._discover_endpoints()

    def _discover_endpoints(self):
        endpoints = {}
        for _, method in inspect.getmembers(self, predicate=inspect.ismethod):
            topic = getattr(method, "kafka_topic", None)
            if topic:
                endpoints[topic] = method

        return endpoints

    async def start(self):
        topics = list(self.endpoints.keys())
        self._consumer.subscribe(topics)
        self._running = True

        print(f"Kafka listening: {topics}")

        while self._running:
            msg = await asyncio.to_thread(self._consumer.poll, 1.0)
            if msg is None:
                continue

            if msg.error():
                print(msg.error())
                continue

            try:
                payload = json.loads(msg.value().decode("utf-8"))

                handler = self.endpoints.get(msg.topic())
                if handler:
                    await handler(payload)

                    self._consumer.commit(msg)

            except Exception:
                # no commit => Kafka will send again
                raise

    async def stop(self):
        self._running = False
        await asyncio.to_thread(self._consumer.close)
