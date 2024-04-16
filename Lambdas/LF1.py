import json
import boto3
import os
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

# Initialize clients
s3_client = boto3.client('s3')
rekognition_client = boto3.client('rekognition')
host = os.environ['OPENSEARCH_HOST']
region = 'us-east-1'
es_index = 'photos'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, 'es', session_token=credentials.token)

# Assuming OpenSearch is set up
es = OpenSearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

def lambda_handler(event, context):
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    object_key = event['Records'][0]['s3']['object']['key']
    
    print(bucket_name)
    print(object_key)
    
    #Detect labels in the image using Rekognition
    rekognition_response = rekognition_client.detect_labels(
        Image={'S3Object': {'Bucket': bucket_name, 'Name': object_key}},
        MaxLabels=10
    )
    # detected_labels = [label['Name'] for label in rekognition_response['Labels']]
    detected_labels = [label['Name'].lower() for label in rekognition_response['Labels']]

    print(detected_labels)
    
    response = s3_client.head_object(Bucket=bucket_name, Key=object_key)
    
    print(response)
    #custom_labels = json.loads(response.get('Metadata', {}).get('customlabels', '[]'))
    custom_labels = response['ResponseMetadata']['HTTPHeaders'].get('x-amz-meta-customlabels', '')
    # custom_labels_list = [label.strip() for label in custom_labels.split(',')] if custom_labels else []
    custom_labels_list = [label.strip().lower() for label in custom_labels.split(',')] if custom_labels else []

    
    # Combine Rekognition labels with any custom labels
    all_labels = list(set(detected_labels + custom_labels_list))
    print(all_labels)
    
    # Prepare document for ElasticSearch
    #all_labels = ['bird','tree']
    document = {
        "objectKey": object_key,
        "bucket": bucket_name,
        "createdTimestamp": datetime.now().isoformat(),
        "labels": all_labels
    }
    print('doc', document)
    
    # Index document in ElasticSearch
    print("elastic -response ",es.index(index="photos", body=document))
    print('last', 'cjksdgufcvsub')
    
    return {
        'statusCode': 200,
        'body': json.dumps('Successfully indexed photo.')
    }