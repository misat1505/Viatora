import asyncio
import inspect
import json
from enum import Enum
from functools import wraps
from typing import Callable, Type

import grpc
from pydantic import BaseModel
from utils.config import create_kafka_consumer


def TopicConsumer(topic: Enum):
    def decorator(func):

        func._kafka_topic = topic.value

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

    cls.__init__ = init_wrapper

    async def start(self):
        topics = list(self.endpoints.keys())
        self._consumer.subscribe(topics)

        print(f"Kafka listening: {topics}")

        while True:
            msg = await asyncio.to_thread(
                self._consumer.poll,
                1.0,
            )
            if msg is None:
                continue

            if msg.error():
                print(msg.error())
                continue

            topic = msg.topic()
            payload = json.loads(msg.value().decode("utf-8"))

            handler = self.endpoints.get(topic)
            if handler:
                await handler(payload)

            self._consumer.commit(msg)

    cls.start = start

    return cls


def ValidateRequest(dto_class: Type[BaseModel]):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(
            self, request, context: grpc.ServicerContext, *args, **kwargs
        ):
            try:
                # 1. convert protobuf/dict → dict
                if hasattr(request, "ListFields"):
                    # protobuf message
                    data = {
                        field.name: getattr(request, field.name)
                        for field, _ in request.ListFields()
                    }
                else:
                    # already dict-like
                    data = dict(request)

                # 2. validate with Pydantic
                validated = dto_class.model_validate(data)

            except Exception as e:
                await context.abort(
                    grpc.StatusCode.INVALID_ARGUMENT,
                    f"Validation error: {str(e)}",
                )
                return

            # 3. replace request with DTO
            return await func(self, validated, context, *args, **kwargs)

        return wrapper

    return decorator
