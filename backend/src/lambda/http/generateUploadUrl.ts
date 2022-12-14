import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getPresignedUrl, attachUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const presignedUrl = await getPresignedUrl(todoId)
    const userId = getUserId(event)

    try {
      await attachUrl(userId, todoId)
      logger.info("Url is attached to todo. TodoId and its userId", todoId, userId);
      logger.info("presignedURL as in generateuploadurl:", presignedUrl);

      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: presignedUrl
        })
      }
    } catch(e){
      logger.error("Error: ", {error: e.message});
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
