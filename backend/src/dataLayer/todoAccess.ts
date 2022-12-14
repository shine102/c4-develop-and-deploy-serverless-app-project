import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger';


const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todosAccess')

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
        ){}
    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos for user: ', userId)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo: ', todoItem)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
        return todoItem
    }

    async updateTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Updating todo: ', todoItem)
        const updateExpression = "set #name = :name, #dueDate=:dueDate, #done=:done";

        const params = {
        TableName: this.todosTable,
        Key: {
            "todoId": todoItem.todoId,
            "userId": todoItem.userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
            ":name": todoItem.name,
            ":dueDate": todoItem.dueDate,
            ":done": todoItem.done
        },
        ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done"
        },
        ReturnValues: "UPDATED_NEW"
        }
        
        await this.update(params);
        return todoItem
    }

    async update(params: any) {
        return await this.docClient.update(params).promise();
    }

    async deleteTodo(
        userId: string,
        todoId: string
    ): Promise<any> {
        logger.info('Deleting todo: ', todoId)
        const params = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            }
        }
        await this.docClient.delete(params).promise();
    }

    async updateUrl(userId, url, todoId){
        logger.info('Updating url: ', url)
        const updateExpression = "set attachmentUrl = :attachmentUrl";

        const params = {
        TableName: this.todosTable,
        Key: {
            "todoId": todoId,
            "userId": userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
            ":attachmentUrl": url
        },
        ReturnValues: "UPDATED_NEW"
        }
        
        await this.update(params);
    }
}

function createDynamoDBClient() {
    logger.info('Creating Todos DynamoDB Client...');
    return new XAWS.DynamoDB.DocumentClient()
}