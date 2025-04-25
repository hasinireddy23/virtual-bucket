import boto3
from botocore.exceptions import ClientError
import os

def send_verification_email(to_email: str, verification_link: str):
    client = boto3.client(
        "ses",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )

    subject = "Verify your email for Virtual Bucket"
    body = f"Click the link to verify your email: {verification_link}"

    try:
        response = client.send_email(
            Source=os.getenv("SES_VERIFIED_EMAIL"),  # Your verified email
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Text": {"Data": body}},
            },
        )
        return response
    except ClientError as e:
        print("Error sending email:", e)
        return None
