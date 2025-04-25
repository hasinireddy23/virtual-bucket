import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve the S3 bucket name and AWS credentials from environment variables
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")

# Initialize S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=aws_region
)

def upload_to_s3(file_obj, file_name):
    """Uploads a file to S3 and returns the file URL."""
    try:
        s3.upload_fileobj(file_obj, BUCKET_NAME, file_name)
        return f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"
    except ClientError as e:
        # Log the detailed error message for debugging
        raise Exception(f"S3 Upload Failed: {e}") from e

def delete_from_s3(file_name):
    """Deletes a file from S3."""
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=file_name)
    except ClientError as e:
        # Log the detailed error message for debugging
        raise Exception(f"S3 Deletion Failed: {e}") from e
