var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");

require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
  region: process.env["AWS_REGION"] 
});
const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
const uploadMulter = multer({ storage }).single("fileInfo");

function writeToDynamoDb(s3Output, req, res) {
  const db = new AWS.DynamoDB();

  var scanInput = {
    ExpressionAttributeNames: {
      "#CT": "creationTime",
    },
    ExpressionAttributeValues: {
      ":k": {
        S: s3Output.key,
      },
    },
    FilterExpression: "file_id = :k",
    ProjectionExpression: "#CT",
    TableName: process.env["DYNAMODB_TABLE_NAME"],
  };

  db.scan(scanInput, function (err, data) {
    if (err) {
      console.log("Failed to scan:", err);
      res.status(404).json({
        err: "Failed to Upload!",
      });
    } else {
      console.log("Scan is successful: ", data);
      var creationTime = new Date().toString();
      if (data.Count > 0) creationTime = data.Items[0].creationTime.S;
      const dbInput = {
        TableName: process.env["DYNAMODB_TABLE_NAME"],
        Item: {
          file_id: { S: s3Output.key },
          userName: { S: req.body.username },
          fileName: { S: req.file.originalname },
          fileType: { S: req.file.mimetype },
          creationTime: { S: creationTime },
          updatedTime: { S: new Date().toString() },
          isDeleted: { BOOL: false },
        },
      };
      db.putItem(dbInput, function (putErr, putRes) {
        if (putErr) {
          console.log("Failed to put item in dynamodb: ", putErr);
          res.status(404).json({
            err: "Failed to Upload!",
          });
        } else {
          console.log("Successfully written to dynamodb", putRes);
          res.status(200).json({
            message: "Upload is successful!",
          });
        }
      });
    }
  });
}

function upload(req, res, next) {
  console.log("access key id: "+process.env["ACCESS_KEY_ID"]);
  console.log("bucket name: "+process.env["BUCKET_NAME"]);
  console.log("entreedd");
  console.log(req.body.username);
  console.log(req.body);
  const s3 = new AWS.S3();
  var input = {
    Bucket: process.env["BUCKET_NAME"],
    Key: req.body.username + "_" + req.file.originalname,
    Body: req.file.buffer,
  };
  s3.upload(input, function (err, data) {
    if (err) {
      console.log("Unable to upload file! Error: ", err);
      res.status(404).json({
        err: "Failed to Upload!",
      });
    } else {
      console.log("Successfully uploaded file to s3:", data);
      writeToDynamoDb(data, req, res);
    }
  });
}

router.post("/", uploadMulter, upload);

module.exports = router;