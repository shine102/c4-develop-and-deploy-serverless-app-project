import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils';
import { TodoUpdate } from '../models/TodoUpdate';
import { BucketAccess } from '../dataLayer/bucketAccess';

const todoAccess = new TodoAccess()
const bucketAccess = new BucketAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest
  })
}

export async function updateTodo(
  todoId: string,
  updatedTodo: UpdateTodoRequest,
  jwtToken: string
): Promise<TodoUpdate> {
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: updatedTodo.name,
    dueDate: updatedTodo.dueDate,
    done: updatedTodo.done
  })
}

export async function deleteTodo(
  todoId: string,
  userId: string): Promise<any> {
    return await todoAccess.deleteTodo(
      userId,
      todoId
    )
  }

export async function attachUrl(userId: string, todoId: string) {
  const url = bucketAccess.getImageUrl(todoId);
  console.log("url in attach url:", url);
  await todoAccess.updateUrl(userId, url, todoId);
}

export async function getPresignedUrl(imageId: uuid){
  const presignedUrl = bucketAccess.getPutSignedUrl(imageId);
  console.log("presigned url:", presignedUrl);

  return presignedUrl;
}

