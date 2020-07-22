# Simple deno API

## TodoList DDL

| key        | type   | example           | description            |
|------------|--------|-------------------|------------------------|
| id         | int    | 2                 | unique key of todolist |
| name       | string | "Sample TodoList" | name of todolist       |
| created_at | date   | undecided         | created timestamp      |
| updated_at | date   | undecided         | updated timestamp      |

## Todo DDL

| key         | type    | example       | description             |
|-------------|---------|---------------|-------------------------|
| id          | int     | 4             | unique key of todo      |
| todolist_id | int     | 2             | foreign key of todolist |
| name        | string  | "Sample Todo" | name of todo            |
| is_favorite | boolean | false         | flag for favorite todo  |
| deadline    | date    | undecided     | task deadline           |
| created_at  | date    | undecided     | created timestamp       |
| updated_at  | date    | undecided     | updated timestamp       |
