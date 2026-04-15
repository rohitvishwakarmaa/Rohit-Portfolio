from typing import Any, Dict, Optional, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar('T')

class ErrorDetail(BaseModel):
    message: str
    details: Optional[Any] = None

class StandardResponse(BaseModel, Generic[T]):
    """
    Standardized API Response wrapper that enforces a strict 
    frontend contract: { data, meta, error }
    """
    data: Optional[T] = None
    meta: Dict[str, Any] = {}
    error: Optional[ErrorDetail] = None

def success_response(data: Any = None, meta: Dict[str, Any] = None, message: str = None) -> dict:
    """
    Utility function to automatically wrap successful responses
    into the standard format.
    """
    if meta is None:
        meta = {}
    
    if message:
        meta["message"] = message
    
    # We return `.model_dump(mode='json')` so FastAPI encodes it identically every time 
    # and ensures complex types like ObjectIds and datetimes are converted to strings.
    return StandardResponse(data=data, meta=meta, error=None).model_dump(mode="json")

