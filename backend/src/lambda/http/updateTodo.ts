import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {createLogger} from '../../utils/logger'

const logger = createLogger('updateToDo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', {event: event});
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    try{
      const todo = await updateTodo(todoId, updatedTodo, jwtToken);
      logger.info('A todo is updated', {updatedItem: updateTodo});

    return {
      statusCode: 204,
      body: JSON.stringify(todo)
    }
    } catch(e) {
      logger.error('Error: ', {error: e.message});
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
    }

  }}
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
