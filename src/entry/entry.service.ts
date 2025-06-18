import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import * as AWS from 'aws-sdk';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EntryService {
    private readonly dynamoTable = "Entries";

    private s3Client = new AWS.S3()
    private dynamoClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        })
    )

    async findAll(limit = 10, lastKey?: Record<string, any>) {
        const params: any = {
            TableName: this.dynamoTable,
            Limit: limit,
        }

        if (lastKey) {
            params.ExclusiveStartKey = lastKey
        }

        const result = await this.dynamoClient.send(new ScanCommand(params))
        
        return {
            items: result.Items || [],
            lastKey: result.LastEvaluatedKey || null,
        }
    }

    async findOne(id: string) {
        const command = new GetCommand({
            TableName: this.dynamoTable,
            Key: { id },
        })

        const result = await this.dynamoClient.send(command)

        if (result.Item) {
            return result.Item
        } else {
            throw new NotFoundException("No entry found")
        }
    }

    async create(title: string, content: string, image?: Express.Multer.File) {
        const id = uuidv4();

        let imageUrl = await this.uploadImage(image)

        const entry = {
            id,
            title,
            content,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString(),
        }

        await this.dynamoClient.send(new PutCommand({
            TableName: this.dynamoTable,
            Item: entry,
        }))

        return { message: "Entry saved", id }
    }

    private async uploadImage(file?: Express.Multer.File): Promise<string | null> {
        if (file) {
            const key = `${Date.now()}-${file.originalname}`
            const bucketName = process.env.AWS_BUCKET_NAME
            if (!bucketName) {
                throw new InternalServerErrorException("No BUCKET_NAME found");
            }
            await this.s3Client.upload({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read'
            }).promise();
            return `https://${bucketName}.s3.amazonaws.com/${key}`;
        } else {
            return null
        }
    }
}
