from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from boto3.dynamodb.conditions import Key
from utils.s3 import upload_to_s3, delete_from_s3
from utils.file import generate_versioned_filename, current_timestamp
from utils.db import file_table
from auth.jwt_bearer import get_current_user
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()
CLOUDFRONT_DOMAIN = os.getenv("CLOUDFRONT_DOMAIN")


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_file(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """
    Uploads file to S3 and updates or creates metadata in DynamoDB.
    Deletes the older S3 version if the file already exists.
    """
    try:
        user_email = current_user['email']
        original_filename = file.filename
        versioned_filename = generate_versioned_filename(user_email, original_filename)
        cloudfront_url = f"{CLOUDFRONT_DOMAIN}/{versioned_filename}"
        timestamp = current_timestamp()
        file_extension = os.path.splitext(original_filename)[1].lstrip(".")

        # Upload new file to S3
        upload_to_s3(file.file, versioned_filename)

        # Check for existing metadata
        existing_file = file_table.query(
            KeyConditionExpression=Key("email").eq(user_email) & Key("filename").eq(original_filename)
        ).get("Items", [])

        if existing_file:
            # Delete old version from S3
            old_s3_filename = existing_file[0]["cloudfront_url"].split("/")[-1]
            delete_from_s3(old_s3_filename)

            # Update existing record
            file_table.update_item(
                Key={"email": user_email, "filename": original_filename},
                UpdateExpression="SET cloudfront_url = :c, last_updated = :u",
                ExpressionAttributeValues={
                    ":c": cloudfront_url,
                    ":u": timestamp
                }
            )
        else:
            # Create new record
            file_table.put_item(Item={
                "email": user_email,
                "filename": original_filename,
                "type": file_extension,
                "cloudfront_url": cloudfront_url,
                "upload_time": timestamp,
                "last_updated": timestamp
            })

        return {"message": "File uploaded and metadata updated successfully."}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Upload failed: {str(e)}")


@router.get("/files", status_code=status.HTTP_200_OK)
def list_files(current_user: str = Depends(get_current_user)):
    """
    Returns all uploaded files for the current user.
    """
    try:
        user_email = current_user['email']
        response = file_table.query(KeyConditionExpression=Key("email").eq(user_email))
        return {"files": response.get("Items", [])}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not fetch files: {str(e)}")


@router.delete("/files/{file_name}", status_code=status.HTTP_200_OK)
def delete_file(file_name: str, current_user: str = Depends(get_current_user)):
    """
    Deletes a file from both S3 and DynamoDB.
    """
    try:
        user_email = current_user['email']

        response = file_table.query(
            KeyConditionExpression=Key("email").eq(user_email) & Key("filename").eq(file_name)
        )
        items = response.get("Items", [])
        if not items:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")

        # Extract S3 filename from CloudFront URL
        s3_filename = items[0]["cloudfront_url"].split("/")[-1]

        # Delete from S3 and DynamoDB
        delete_from_s3(s3_filename)
        file_table.delete_item(Key={"email": user_email, "filename": file_name})

        return {"message": "File deleted successfully from S3 and DynamoDB."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Deletion failed: {str(e)}")
