import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('creteToDo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', {event: event});
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    try {
      const newItem = await createTodo(
        newTodo,
        jwtToken
      )
      logger.info('A new toDo item is created: ', {item: newItem});
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: newItem
        })
      }
    }
    catch (e) {
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

handler.use(
  cors({
    credentials: true
  })
)

