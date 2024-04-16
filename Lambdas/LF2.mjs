import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2"; // ES Modules import
import { defaultProvider } from '@aws-sdk/credential-provider-node'; // V3 SDK.
import { Client } from '@opensearch-project/opensearch';
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

const client = new LexRuntimeV2Client({ region: "us-east-1" });

const esclient = new Client({
  ...AwsSigv4Signer({
    region: 'us-east-1',
    service: 'es',  // 'aoss' for OpenSearch Serverless
    // Must return a Promise that resolve to an AWS.Credentials object.
    // This function is used to acquire the credentials when the client start and
    // when the credentials are expired.
    // The Client will refresh the Credentials only when they are expired.
    // With AWS SDK V2, Credentials.refreshPromise is used when available to refresh the credentials.

    // Example with AWS SDK V3:
    getCredentials: () => {
      // Any other method to acquire a new Credentials object can be used.
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  node: 'https://search-photos-ondihl2xvet5dlvgse2rxgcvvm.us-east-1.es.amazonaws.com', // OpenSearch domain URL
  // node: "https://xxx.region.aoss.amazonaws.com" for OpenSearch Serverless
});

const get_openSearch = async (labels) => {
  const url = "https://search-photos-ondihl2xvet5dlvgse2rxgcvvm.us-east-1.es.amazonaws.com"+"/photos/"+"_search"
  var query = {
  "size": 5, 
  "query": {
      "terms" : {
        "labels.keyword" : labels
      }
    }
}
 var response = await esclient.search({
  index: "photos",
  body: query,
});

console.log(response);//._source.Restaurant);
return response.body.hits.hits;

}

export const handler = async (event) => {
  
  console.log(event);
  
  if (event.queryStringParameters.q) {
      const input = { // RecognizeTextRequest
      botId: "RSBMGRHV92", // required
      botAliasId: "TSTALIASID", // required
      localeId: "en_US", // required
      sessionId: "temp_session",
      text: event.queryStringParameters.q, // required
    };
  const command = new RecognizeTextCommand(input);
  const botresponse = await client.send(command);
  console.log(botresponse.sessionState.intent.slots.label.values);
  var labels = Array.from(botresponse.sessionState.intent.slots.label.values, (value) => value.value.interpretedValue.toLowerCase());
  console.log(labels)
  const openresponse = await get_openSearch(labels);
  let imgs = []
  if(openresponse) {
    for(let hit of openresponse) {
      imgs.push({
        "url": "https://" + hit._source.bucket + ".s3.us-east-1.amazonaws.com/" + hit._source.objectKey,
        "labels": hit._source.labels
      }); 
    }
    console.log(imgs);
  }
  
  const response = {
    "statusCode": 200,
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      "results": imgs
    })
  };
  
  console.log(response);
  return response;
  
  }
  else{
  const response = {
    "statusCode": 200,
    "headers": {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      "results": []
    })
  };
  return response;
  }
  
};