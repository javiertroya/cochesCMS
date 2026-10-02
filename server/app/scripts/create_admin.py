"""Crea (o reactiva) un usuario administrador.

Uso:
    python -m app.scripts.create_admin --email admin@midominio.com --name "Admin"
    (pide la contraseña por consola si no se pasa --password)

Con Docker:
    docker compose exec api python -m app.scripts.create_admin --email ... --name ...
"""

import argparse
import getpass
import sys

from app.models.User import UserCreate, UserUpdate
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def main() -> int:
    parser = argparse.ArgumentParser(description="Crear usuario administrador")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Administrador")
    parser.add_argument("--password", help="Si no se indica, se pide por consola")
    args = parser.parse_args()

    password = args.password or getpass.getpass("Contraseña (mín. 8 caracteres): ")
    if len(password) < 8:
        print("La contraseña debe tener al menos 8 caracteres", file=sys.stderr)
        return 1

    existing = UserRepository.find_by_email(args.email)
    if existing:
        UserService.update_user(
            existing["id"],
            UserUpdate(password=password, role="admin", is_active=True),
        )
        print(f"Usuario {args.email} actualizado como administrador activo.")
        return 0

    UserService.create_user(
        UserCreate(name=args.name, email=args.email, password=password, role="admin")
    )
    print(f"Administrador {args.email} creado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
