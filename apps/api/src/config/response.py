
from typing import Any, Dict, List

from fastapi.responses import JSONResponse


def success(data: str | Dict[str, Any] | List | None, status_code: int = 200):
    return JSONResponse(
        content={
            "success": True,
            "data": data
        },
        status_code=status_code
    )

def failure(data: str | Dict[str, Any], status_code: int = 400):
    return JSONResponse(
        content={
            "success": False,
            "error": data
        },
        status_code=status_code
    )
