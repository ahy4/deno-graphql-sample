# Simple deno API

## TodoList DDL

| key        | type   | example           | description            |
|------------|--------|-------------------|------------------------|
| id         | int    | 2                 | unique key of todolist |
| name       | string | "Sample TodoList" | name of todolist       |
| created\_at | date   | undecided         | created timestamp      |
| updated\_at | date   | undecided         | updated timestamp      |

## Todo DDL

| key         | type    | example       | description             |
|-------------|---------|---------------|-------------------------|
| id          | int     | 4             | unique key of todo      |
| todolist\_id | int     | 2             | foreign key of todolist |
| name        | string  | "Sample Todo" | name of todo            |
| is\_favorite | boolean | false         | flag for favorite todo  |
| deadline    | date    | undecided     | task deadline           |
| created\_at  | date    | undecided     | created timestamp       |
| updated\_at  | date    | undecided     | updated timestamp       |
