from datetime import UTC, datetime
from uuid import UUID

from langchain_core.messages import BaseMessage
from langchain_core.messages.base import message_to_dict
from sqlalchemy import delete, select

from ..config.db import async_session_maker
from .models import Session, UploadStatus, Workspace


def _to_uuid(value: str) -> UUID | None:
    try:
        return UUID(str(value))
    except (ValueError, AttributeError, TypeError):
        return None


def _apply_updates(model, updates: dict):
    for key, value in updates.items():
        if hasattr(model, key):
            setattr(model, key, value)


# ----- Workspace -----
class WorkspaceRepository:
    @staticmethod
    async def get_workspace_by_id(workspace_id: str):
        workspace_uuid = _to_uuid(workspace_id)
        if workspace_uuid is None:
            return None

        async with async_session_maker() as session:
            return await session.get(Workspace, workspace_uuid)

    @staticmethod
    async def get_all_workspaces(user_id: str):
        user_uuid = _to_uuid(user_id)
        if user_uuid is None:
            return []

        async with async_session_maker() as session:
            result = await session.execute(
                select(Workspace)
                .where(Workspace.user_id == user_uuid)
                .order_by(Workspace.created_at.desc())
            )
            return list(result.scalars().all())

    @staticmethod
    async def create_new_workspace(user_id: str):
        async with async_session_maker() as session:
            workspace = Workspace(
                user_id=_to_uuid(user_id),
                name="Untitled Workspace",
                description="",
                tags=[],
                materials=[],
            )
            session.add(workspace)
            await session.commit()
            await session.refresh(workspace)
            return workspace

    @staticmethod
    async def update_workspace(workspace_id: str, updates: dict):
        async with async_session_maker() as session:
            workspace = await session.get(Workspace, _to_uuid(workspace_id))
            if workspace is None:
                return None

            _apply_updates(workspace, updates)
            await session.commit()
            await session.refresh(workspace)
            return workspace

    @staticmethod
    async def append_workspace_materials(workspace_id: str, materials: list[dict]):
        async with async_session_maker() as session:
            workspace = await session.get(Workspace, _to_uuid(workspace_id))
            if workspace is None:
                return None

            workspace.materials = [*workspace.materials, *materials]
            await session.commit()
            await session.refresh(workspace)
            return workspace

    @staticmethod
    async def delete_workspace(workspace_id: str):
        async with async_session_maker() as session:
            await session.execute(
                delete(Workspace).where(Workspace.id == _to_uuid(workspace_id))
            )
            await session.commit()

    @staticmethod
    async def delete_workspace_sessions(workspace_id: str):
        async with async_session_maker() as session:
            await session.execute(
                delete(Session).where(
                    Session.workspace_id == _to_uuid(workspace_id)
                )
            )
            await session.commit()


# ----- Session -----


class SessionRepository:
    @staticmethod
    async def get_session_by_id(session_id: str):
        session_uuid = _to_uuid(session_id)
        if session_uuid is None:
            return None

        async with async_session_maker() as session:
            return await session.get(Session, session_uuid)

    @staticmethod
    async def get_sessions_by_workspace_id(workspace_id: str):
        workspace_uuid = _to_uuid(workspace_id)
        if workspace_uuid is None:
            return []

        async with async_session_maker() as session:
            result = await session.execute(
                select(Session)
                .where(Session.workspace_id == workspace_uuid)
                .order_by(Session.created_at.desc())
            )
            return list(result.scalars().all())

    @staticmethod
    async def create_session(workspace_id: str):
        async with async_session_maker() as session:
            chat_session = Session(
                workspace_id=_to_uuid(workspace_id),
                name="Untitled Session",
                messages=[],
            )
            session.add(chat_session)
            await session.commit()
            await session.refresh(chat_session)
            return chat_session

    @staticmethod
    async def update_session(session_id: str, updates: dict):
        async with async_session_maker() as session:
            chat_session = await session.get(Session, _to_uuid(session_id))
            if chat_session is None:
                return None

            _apply_updates(chat_session, updates)
            await session.commit()
            await session.refresh(chat_session)
            return chat_session

    @staticmethod
    async def delete_session(session_id: str):
        async with async_session_maker() as session:
            await session.execute(
                delete(Session).where(Session.id == _to_uuid(session_id))
            )
            await session.commit()

    @staticmethod
    async def update_messages(session_id: str, messages: list[BaseMessage]):
        async with async_session_maker() as session:
            chat_session = await session.get(Session, _to_uuid(session_id))
            if chat_session is None:
                return None

            chat_session.messages = [
                message_to_dict(message) for message in messages
            ]
            await session.commit()
            await session.refresh(chat_session)
            return chat_session


# ----- Uploads -----


class UploadRepository:
    @staticmethod
    async def get_upload_status_by_id(status_id: str):
        status_uuid = _to_uuid(status_id)
        if status_uuid is None:
            return None

        async with async_session_maker() as session:
            return await session.get(UploadStatus, status_uuid)

    @staticmethod
    async def create_upload_status(workspace_id: str, user_id: str, files: list[dict]):
        now = datetime.now(UTC)
        async with async_session_maker() as session:
            upload_status = UploadStatus(
                workspace_id=_to_uuid(workspace_id),
                user_id=_to_uuid(user_id),
                status="uploaded",
                files=files,
                logs=[],
                created_at=now,
                updated_at=now,
                completed_at=None,
                error=None,
            )
            session.add(upload_status)
            await session.commit()
            await session.refresh(upload_status)
            return upload_status

    @staticmethod
    async def update_upload_status(status_id: str, updates: dict):
        async with async_session_maker() as session:
            upload_status = await session.get(UploadStatus, _to_uuid(status_id))
            if upload_status is None:
                return None

            _apply_updates(upload_status, updates)
            await session.commit()
            await session.refresh(upload_status)
            return upload_status
