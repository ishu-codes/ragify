from typing import Any

from fastapi.responses import JSONResponse


def success(
    data: str | dict[str, Any] | list | None, status_code: int = 200
) -> JSONResponse:
    return JSONResponse(
        content={"success": True, "data": data}, status_code=status_code
    )


def failure(data: str | dict[str, Any], status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        content={"success": False, "error": data}, status_code=status_code
    )
