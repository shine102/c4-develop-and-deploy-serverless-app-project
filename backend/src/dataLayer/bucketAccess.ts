import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('bucketAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class BucketAccess{
    constructor(
        private s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly bucketName = process.env.TODOS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ){}
    
    getPutSignedUrl( key: string ) : string {
        var presignedUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: parseInt(this.urlExpiration),
        });
        console.log("presignedUrl in getPutSignedUrl:", presignedUrl);
        return presignedUrl;
    }

    getImageUrl(imageId){
        const url = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`;
        logger.info('getImageUrl: ', {imageUrl: url});
        return url;
    }
}
