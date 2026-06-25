import grpc


class ServiceKeyInterceptor(grpc.aio.ServerInterceptor):
    def __init__(self, service_key: str):
        self.service_key = service_key

    async def intercept_service(self, continuation, handler_call_details):
        metadata = dict(handler_call_details.invocation_metadata or [])
        print(metadata)

        service_key_metadata = metadata.get("x-service-key")

        if self.service_key != service_key_metadata:

            async def abort_handler(_, context):
                await context.abort(
                    grpc.StatusCode.PERMISSION_DENIED,
                    "Invalid service key",
                )

            return grpc.unary_unary_rpc_method_handler(abort_handler)

        return await continuation(handler_call_details)
