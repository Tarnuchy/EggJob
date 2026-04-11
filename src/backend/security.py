from passlib.context import CryptContext


_password_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)
#nie mam pojęcia jak to działa czyli użytkownicy w pełni bezpieczni

def hash_password(password: str) -> str:
    return _password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _password_context.verify(password, password_hash)


def password_needs_rehash(password_hash: str) -> bool:
    return _password_context.needs_update(password_hash)
