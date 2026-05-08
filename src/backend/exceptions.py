class AppError(Exception):
    """Base class for domain-level errors."""


class ValidationError(AppError):
    """Input data is invalid or incomplete."""


class ConflictError(AppError):
    """Request conflicts with existing state (duplicates, already exists)."""


class AuthenticationError(AppError):
    """Authentication failed (invalid credentials)."""


class PermissionDeniedError(AppError):
    """Caller lacks required permissions."""


class NotFoundError(AppError):
    """Requested resource was not found."""


class StateError(AppError):
    """Operation cannot proceed due to invalid or inconsistent state."""
