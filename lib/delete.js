var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");

require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

const db = new AWS.DynamoDB();

function deleteInS3(file_id, res) {
  const s3 = new AWS.S3();
  var input = {
    Bucket: process.env["BUCKET_NAME"],
    Key: file_id,
  };
  s3.deleteObject(input, function (err, data) {
    if (err) {
      console.log("Error deleting file in s3! Error: ", err);
    } else {
      console.log("Successfully deleted file from s3:", data);
    }
    // No need to notify user about s3 delete failure (if there is any) as the item is already marked as delete in dynamodb.
    res.status(200).json({
      message: "Successfully deleted file!",
    });
  });
}

function markDeleteInDynamoDbAndS3(item, req, res) {
  item.updatedTime.S = new Date().toString();
  item.isDeleted.BOOL = true;
  var file_id = item.file_id;
  const dbInput = {
    TableName: process.env["DYNAMODB_TABLE_NAME"],
    Item: item,
  };
  db.putItem(dbInput, function (err, data) {
    if (err) {
      console.log("Failed to mark delete in dynamodb: ", err);
      res.status(404).json({
        err: "Failed to delete!",
      });
    } else {
      console.log("Marked file as deleted in dynamodb: ", data);
      deleteInS3(file_id.S, res);
    }
  });
}

function deleteFile(req, res, next) {
  console.log(req.body);
  console.log("receieved request" + req.body.username);
  console.log("receieved request" + req.body.filename);
  var scanInput = {
    ExpressionAttributeValues: {
      ":k": {
        S: req.body.username + "_" + req.body.filename,
      },
    },
    FilterExpression: "file_id = :k",
    TableName: process.env["DYNAMODB_TABLE_NAME"],
  };

  db.scan(scanInput, function (err, data) {
    if (err) {
      console.log("Failed to scan:", err);
      res.status(404).json({
        err: "Failed to delete!",
      });
      return;
    }

    if (data.Count == 0) {
      console.log("Item not found in dynamodb");
      res.status(404).json({
        err: "Failed to delete!",
      });
      return;
    }

    var item = data.Items[0];
    if (item.isDeleted.BOOL) {
      console.log("File is already deleted!");
      res.status(404).json({
        err: "File is already deleted!",
      });
      return;
    }

    markDeleteInDynamoDbAndS3(item, req, res);
  });
}

router.post("/", deleteFile);

module.exports = router;