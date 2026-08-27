import sqlite3
import sys


def deny_dangerous(opcode, _arg1, _arg2, _database, _trigger):
    denied = {
        sqlite3.SQLITE_ATTACH,
        sqlite3.SQLITE_DETACH,
    }
    return sqlite3.SQLITE_DENY if opcode in denied else sqlite3.SQLITE_OK


def statements(source):
    buffer = ""
    for line in source.splitlines(keepends=True):
        buffer += line
        if sqlite3.complete_statement(buffer):
            if buffer.strip():
                yield buffer
            buffer = ""
    if buffer.strip():
        raise ValueError("incomplete SQL statement")


def main():
    if len(sys.argv) != 2:
        raise SystemExit(2)
    source = open(sys.argv[1], "r", encoding="utf-8").read()
    connection = sqlite3.connect(":memory:")
    connection.enable_load_extension(False)
    connection.set_authorizer(deny_dangerous)
    connection.set_progress_handler(lambda: 0, 10_000)
    connection.setlimit(sqlite3.SQLITE_LIMIT_SQL_LENGTH, 65_536)
    connection.setlimit(sqlite3.SQLITE_LIMIT_LENGTH, 1_048_576)
    for statement in statements(source):
        cursor = connection.execute(statement)
        if cursor.description:
            print(" | ".join(column[0] for column in cursor.description))
            for row in cursor.fetchall():
                print(" | ".join("" if value is None else str(value) for value in row))


if __name__ == "__main__":
    main()
