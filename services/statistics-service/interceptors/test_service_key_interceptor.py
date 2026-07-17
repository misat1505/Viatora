from unittest.mock import AsyncMock, MagicMock

import grpc
import pytest
from interceptors.service_key_interceptor import ServiceKeyInterceptor


@pytest.mark.asyncio
async def test_interceptor_allows_valid_service_key():
    interceptor = ServiceKeyInterceptor(service_key="valid-key")

    rpc_handler = MagicMock()
    continuation = AsyncMock(return_value=rpc_handler)

    handler_call_details = MagicMock()
    handler_call_details.invocation_metadata = [("x-service-key", "valid-key")]

    result = await interceptor.intercept_service(
        continuation,
        handler_call_details,
    )

    assert result == rpc_handler
    continuation.assert_called_once()


@pytest.mark.asyncio
async def test_interceptor_blocks_invalid_service_key():
    interceptor = ServiceKeyInterceptor(service_key="valid-key")

    continuation = AsyncMock()

    handler_call_details = MagicMock()
    handler_call_details.invocation_metadata = [("x-service-key", "wrong-key")]

    result = await interceptor.intercept_service(
        continuation,
        handler_call_details,
    )

    assert result is not None

    rpc_handler = result

    context = MagicMock()
    context.abort = AsyncMock()

    await rpc_handler.unary_unary(None, context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.PERMISSION_DENIED,
        "Invalid service key",
    )
