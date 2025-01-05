#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/infra-stack";
import { AWS_ACCOUNT, AWS_REGION } from "../.env";

const app = new cdk.App();
new InfraStack(app, "InfraStack", {
  env: {
    account: AWS_ACCOUNT,
    region: AWS_REGION,
  },
  envname: "base-dev", // カスタムプロパティを渡す
});
