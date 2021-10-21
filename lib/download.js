var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");

require("dotenv").config();

AWS.config.update({
  region: process.env["AWS_REGION"],
  accessKeyId: process.env["ACCESS_KEY_ID"],
  secretAccessKey: process.env["SECRET_ACCESS_KEY"],
});

function download(req, res, next) {
  console.log(req.body);
  console.log(process.env["CLOUDFRONT_ACCESS_KEY_ID"]);
  console.log(process.env["CLOUDFRONT_PRIVATE_KEY"]);
  console.log(process.env["CLOUDFRONT_URL"] + req.query.userName + "_" + req.query.fileName);
  const oneHour = 60 * 60 * 1000;
  const signer = new AWS.CloudFront.Signer(
    process.env["CLOUDFRONT_ACCESS_KEY_ID"],
    process.env["CLOUDFRONT_PRIVATE_KEY"]
  );
  var input = {
    url: process.env["CLOUDFRONT_URL"] + req.query.userName + "_" + req.query.fileName,
    expires: Math.floor((Date.now() + oneHour) / 1000),
  };

  const signedUrl = signer.getSignedUrl(input);
  res.setHeader("content-disposition", "attachment; filename=" + req.query.fileName);
  require('request').get(signedUrl).pipe(res);
}

router.get("/", download);

module.exports = router;