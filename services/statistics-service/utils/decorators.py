from functools import wraps
from typing import Callable, Type

import grpc
from pydantic import BaseModel


def KafkaTopic(topic):
    def decorator(func):
        func.kafka_topic = topic.value
        return func

    return decorator


def ValidatePayload(model: type[BaseModel]):
    def decorator(func):
        def wrapper(self, data: dict):
            validated_payload = model.model_validate(data)
            return func(self, validated_payload)

        return wrapper

    return decorator


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
