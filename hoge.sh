#!/bin/bash

declare -r query=$(cat << 'EOF'
mutation CreateTodoList(
  $createTodoListInput: CreateTodoListInput!,
  $createTodoInput: CreateTodoInput!,
  $updateTodoListInput: UpdateTodoListInput!,
  $updateTodoInput: UpdateTodoInput!) {
  createTodoList(input: $createTodoListInput) {
    done
  }
  createTodo(input: $createTodoInput) {
    done
  }
  updateTodoList(input: $updateTodoListInput) {
    done
  }
  updateTodo(input: $updateTodoInput) {
    done
  }
}
EOF
)

curl 'https://deno-server.herokuapp.com/graphql' \
  -H 'content-type: application/json' \
  --data-binary '{
    "operationName": "CreateTodoList",
    "variables": {
      "createTodoListInput": {
        "name": "xxx"
      },
      "createTodoInput": {
        "name": "yyy",
        "todoListId": 1,
        "isFavorite": true,
        "deadline": "2020/09/01"
      },
      "updateTodoListInput": {
        "todoListId": 1,
        "name": "zzz"
      },
      "updateTodoInput": {
        "todoId": 1,
        "name": "www",
        "isFavorite": true
      }
    },
    "query": "'"$(echo "$query" | sed -z "s/\n/\\\\n/g")"'"
  }' \
  --compressed

