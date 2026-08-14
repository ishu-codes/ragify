
def serialize_user(user: dict) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email
    }
