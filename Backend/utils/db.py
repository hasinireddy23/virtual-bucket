import boto3
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Use environment variables for AWS credentials
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")

# Initialize DynamoDB resource
dynamodb = boto3.resource(
    'dynamodb',
    region_name=aws_region,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# DynamoDB table reference
file_table = dynamodb.Table('user_files')
user_table = dynamodb.Table('users')