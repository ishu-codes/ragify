# from typing import Any

# from langchain_core.messages import BaseMessage
# from pydantic import BaseModel, Field


# class Material(BaseModel):
#     id: str
#     name: str
#     kind: str
#     size: int
#     mime_type: str
#     storage_path: str
#     created_at: str


# class UploadStatusFile(BaseModel):
#     id: str
#     name: str
#     kind: str
#     size: int
#     mime_type: str
#     storage_path: str
#     status: str
#     error: str | None = None
#     created_at: str


# class UploadStatusLog(BaseModel):
#     message: str
#     created_at: str


# class UploadStatus(BaseModel):
#     id: str | None = Field(alias="_id")
#     workspace_id: str
#     user_id: str
#     status: str
#     files: list[UploadStatusFile]
#     logs: list[UploadStatusLog]
#     created_at: str
#     updated_at: str
#     completed_at: str | None = None
#     error: str | None = None


# class Session(BaseModel):
#     id: str | None = Field(alias="_id")
#     workspace_id: str
#     name: str
#     messages: list[BaseMessage | dict[str, Any]]
#     created_at: str


# class Workspace(BaseModel):
#     id: str | None = Field(alias="_id")
#     user_id: str
#     name: str
#     description: str
#     tags: list[str]
#     materials: list[Material]
#     created_at: str

#     class Config:
#         populate_by_name = True
