import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { parseUserId } from "../../auth/utils";

const logger = createLogger('getTodos');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', {event: event});
    // Write your code here

    const authHeader = event.headers.Authorization;
    const authSplit = authHeader.split(" ");
    const userId = parseUserId(authSplit[1]);

    try{
      const result = await getTodosForUser(userId);
      logger.info('Result: ', { result: result});
  
      const items = result;
      return {
        statusCode: 200,
        body: JSON.stringify({
          items
        })
      }
    }
    catch (e) {
      logger.error('Error: ', {error: e.message});
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.message
        })
    }}}
)

handler.use(
  cors({
    credentials: true
  })
)
