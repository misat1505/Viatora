from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from pydantic import BaseModel
from utils.convert_datetimes_to_ints import convert_datetimes_to_ints
from utils.user_to_proto import user_to_proto
from utils.validate_request import ValidateRequest


def test_convert_datetimes_to_ints_basic():
    dt = datetime(2024, 1, 1, tzinfo=UTC)

    result = convert_datetimes_to_ints({"created_at": dt, "name": "test", "count": 5})

    assert isinstance(result["created_at"], int)
    assert result["name"] == "test"
    assert result["count"] == 5


def test_convert_datetimes_to_ints_multiple_values():
    dt1 = datetime(2024, 1, 1, tzinfo=UTC)
    dt2 = datetime(2025, 1, 1, tzinfo=UTC)

    result = convert_datetimes_to_ints(
        {
            "a": dt1,
            "b": dt2,
        }
    )

    assert isinstance(result["a"], int)
    assert isinstance(result["b"], int)


def test_convert_datetimes_to_ints_ignores_non_datetime_objects():
    result = convert_datetimes_to_ints(
        {"dt": "not-a-datetime", "num": 123, "nested": {"x": 1}}
    )

    assert result["dt"] == "not-a-datetime"
    assert result["num"] == 123


def test_user_to_proto_full_mapping():
    user = SimpleNamespace(
        user_id=123,
        email="test@mail.com",
        display_name="Test",
        avatar_url="http://img.com/a.png",
        is_active=True,
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
        last_login_at=datetime(2024, 1, 2, tzinfo=UTC),
    )

    proto = user_to_proto(user)

    assert proto.user_id == "123"
    assert proto.email == "test@mail.com"
    assert proto.display_name == "Test"
    assert proto.avatar_url == "http://img.com/a.png"
    assert proto.is_active is True
    assert proto.created_at.startswith("2024-01-01")
    assert proto.last_login_at.startswith("2024-01-02")


def test_user_to_proto_handles_null_last_login():
    user = SimpleNamespace(
        user_id=123,
        email="test@mail.com",
        display_name="Test",
        avatar_url=None,
        is_active=False,
        created_at=datetime(2024, 1, 1),
        last_login_at=None,
    )

    proto = user_to_proto(user)

    assert proto.avatar_url == ""
    assert proto.last_login_at == ""


class DummyDTO(BaseModel):
    name: str


class FakeContext:
    def __init__(self):
        self.aborted = False
        self.code = None
        self.details = None

    async def abort(self, code, details):
        self.aborted = True
        self.code = code
        self.details = details
        raise Exception("aborted")


@pytest.mark.asyncio
async def test_validate_request_with_dict():
    decorator = ValidateRequest(DummyDTO)

    class Service:
        @decorator
        async def handler(self, request, context):
            return request

    service = Service()
    context = FakeContext()

    result = await service.handler({"name": "test"}, context)

    assert isinstance(result, DummyDTO)
    assert result.name == "test"


@pytest.mark.asyncio
async def test_validate_request_invalid_data():
    decorator = ValidateRequest(DummyDTO)

    class Service:
        @decorator
        async def handler(self, request, context):
            return request

    service = Service()
    context = FakeContext()

    with pytest.raises(Exception):
        await service.handler({"wrong_field": 123}, context)

    assert context.aborted is True


class FakeField:
    def __init__(self, name):
        self.name = name


class FakeProto:
    def ListFields(self):
        return [(FakeField("name"), None)]

    name = "test"


@pytest.mark.asyncio
async def test_validate_request_protobuf():
    decorator = ValidateRequest(DummyDTO)

    class Service:
        @decorator
        async def handler(self, request, context):
            return request

    service = Service()
    context = FakeContext()

    result = await service.handler(FakeProto(), context)

    assert isinstance(result, DummyDTO)
    assert result.name == "test"
