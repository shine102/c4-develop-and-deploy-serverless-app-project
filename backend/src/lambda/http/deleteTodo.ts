import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', {event: event});
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    try {
      await deleteTodo(
        todoId,
        userId
      )
      return {
        statusCode: 200,
        body: ''
      }
    } catch(e){
      logger.error('Error: ', {error: e.message});
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
