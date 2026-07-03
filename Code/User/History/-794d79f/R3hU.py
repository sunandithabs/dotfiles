import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')


class DictCursor(sqlite3.Cursor):
    def execute(self, sql, params=()):
        if "%s" in sql:
            sql = sql.replace("%s", "?")
        return super().execute(sql, params)

    def executemany(self, sql, seq_of_params):
        if "%s" in sql:
            sql = sql.replace("%s", "?")
        return super().executemany(sql, seq_of_params)

    def fetchone(self):
        row = super().fetchone()
        return dict(row) if row is not None else None

    def fetchall(self):
        rows = super().fetchall()
        return [dict(row) for row in rows]


class ConnectionWrapper:
    def __init__(self, conn):
        self._conn = conn

    def cursor(self, dictionary=False):
        if dictionary:
            return self._conn.cursor(factory=DictCursor)
        return self._conn.cursor()

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        return self._conn.close()


def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return ConnectionWrapper(conn)


@contextmanager
def db_connection():
    conn = get_db()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with db_connection() as conn:
        cursor = conn.cursor()

        # Disable FK checks so drops don't fail on constraints
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

        # Drop in reverse dependency order
        cursor.execute("DROP TABLE IF EXISTS order_items")
        cursor.execute("DROP TABLE IF EXISTS orders")
        cursor.execute("DROP TABLE IF EXISTS menu_items")
        cursor.execute("DROP TABLE IF EXISTS users")

        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        # TABLE 1 — users
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(100)  NOT NULL,
                email      VARCHAR(100)  UNIQUE NOT NULL,
                password   VARCHAR(255)  NOT NULL,
                created_at DATETIME      DEFAULT CURRENT_TIMESTAMP
            ) AUTO_INCREMENT = 1
              CHARACTER SET utf8mb4
              COLLATE utf8mb4_unicode_ci
        """)

        # TABLE 2 — menu items
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS menu_items (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                name         VARCHAR(100)   NOT NULL,
                category     VARCHAR(100),
                description  TEXT,
                price        DECIMAL(10, 2) NOT NULL,
                emoji        VARCHAR(10),
                is_available BOOLEAN        DEFAULT TRUE
            ) AUTO_INCREMENT = 1
              CHARACTER SET utf8mb4
              COLLATE utf8mb4_unicode_ci
        """)

        # TABLE 3 — orders
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                user_id    INT NOT NULL,
                status     ENUM('pending','confirmed','preparing','delivered','cancelled')
                               DEFAULT 'pending',
                address    TEXT,
                ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) AUTO_INCREMENT = 1
              CHARACTER SET utf8mb4
              COLLATE utf8mb4_unicode_ci
        """)

        # TABLE 4 — order items
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id       INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT            NOT NULL,
                item_id  INT            NOT NULL,
                quantity INT            DEFAULT 1,
                subtotal DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (item_id)  REFERENCES menu_items(id)
            ) AUTO_INCREMENT = 1
              CHARACTER SET utf8mb4
              COLLATE utf8mb4_unicode_ci
        """)

        cursor.close()


def seed_menu():
    with db_connection() as conn:
        cursor = conn.cursor()

        # Don't seed twice
        cursor.execute("SELECT COUNT(*) FROM menu_items")
        if cursor.fetchone()[0] > 0:
            cursor.close()
            return

        items = [
            ("Pizza",       "Italian",  "Crispy crust, stretchy mozzarella",     249.00, "🍕"),
            ("Burger",      "American", "Juicy beef patty with secret sauce",     179.00, "🍔"),
            ("Burrito",     "Mexican",  "Loaded wrap with rice, beans and guac",  199.00, "🌯"),
            ("Taco",        "Mexican",  "Crispy shell with grilled chicken",      149.00, "🌮"),
            ("Ice Cream",   "Dessert",  "Velvety scoops in 12 flavours",          129.00, "🍦"),
            ("Milkshake",   "Beverage", "Thick creamy shakes blended fresh",      159.00, "🥛"),
            ("Fries",       "Snack",    "Golden double fried shoestring fries",    99.00, "🍟"),
            ("Mango Juice", "Beverage", "Fresh, pulpy and thick",                 129.00, "🥭"),
            ("Donut", "Dessert", "Glazed ring fried golden, dusted with sugar", 89.00, "🍩"),
            ("Pasta", "Italian", "Al dente penne tossed in rich arrabbiata sauce", 219.00, "🍝"),
        ]

        cursor.executemany("""
            INSERT INTO menu_items (name, category, description, price, emoji)
            VALUES (%s, %s, %s, %s, %s)
        """, items)

        cursor.close()