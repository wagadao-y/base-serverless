import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";

// カスタムプロパティのインターフェースを定義
interface InfraStackProps extends cdk.StackProps {
  envname: string; // CDKのスタック名に付与する環境名
  originDomains?: string[]; // 独自ドメイン
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const envname = props.envname;

    // Webサイト用のS3 Bucketを作成
    const staticSiteBucket = new s3.Bucket(this, "StaticSiteBucket", {
      bucketName: `${envname}-static-site-bucket`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Webサイト用の静的ファイルをS3にアップロード
    new s3_deployment.BucketDeployment(
      this,
      `StaticSiteBucketUpload-${envname}`,
      {
        sources: [s3_deployment.Source.asset("../frontend/build")],
        destinationBucket: staticSiteBucket,
      }
    );

    // DynamoDBテーブルを作成
    const table = new dynamodb.Table(this, "AppTable", {
      tableName: `${envname}-app-table`,
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // // 必要であればGSIを追加
    // table.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "GSI1PK",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: "GSI1SK",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    // });

    // Cognitoユーザープールの作成
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${envname}-user-pool`,
      selfSignUpEnabled: false, // ユーザーの自己サインアップを禁止
      signInAliases: {
        username: true,
        email: false,
        phone: false,
      },
      passwordPolicy: {
        minLength: 8, // 最低8文字
        requireLowercase: true, // 小文字を必要とする
        requireUppercase: true, // 大文字を必要とする
        requireDigits: true, // 数字を必要とする
        requireSymbols: true, // 記号を必要とする
      },
      accountRecovery: cognito.AccountRecovery.NONE, // アカウントリカバリーを無効化
      removalPolicy: cdk.RemovalPolicy.RETAIN, // スタック削除時にユーザープールを削除しない
      // 以下はMFA用
      mfa: cognito.Mfa.REQUIRED, // MFAを必須に変更
      mfaSecondFactor: {
        otp: true, // ワンタイムパスワード(QRコード)
        sms: false,
        email: false,
      },
    });

    // ユーザープールクライアントの作成
    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      userPoolClientName: `${envname}-user-pool-client`,
      authFlows: {
        adminUserPassword: true, // IAMロールを使ったバックエンドからの認証を許可
      },
      accessTokenValidity: cdk.Duration.minutes(60), // アクセストークンの有効期限を60分に設定
      refreshTokenValidity: cdk.Duration.days(30), // リフレッシュトークンの有効期限を30日に設定
    });

    // API用のLambda関数を作成
    const apiLambdaFunction = new lambda_nodejs.NodejsFunction(
      this,
      "ApiLambdaFunction",
      {
        functionName: `${envname}-api-lambda`,
        entry: "../backend/src/index.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 512,
        bundling: {
          forceDockerBundling: false,
        },
        timeout: cdk.Duration.seconds(10),
        environment: {
          // 環境変数
          TABLE_NAME: table.tableName, // DynamoDBのテーブル名
          USER_POOL_ID: userPool.userPoolId, // CognitoのユーザープールID
          USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId, // CognitoのクライアントID
          ORIGIN_URLS:
            "['https://xxxxxxxx.cloudfront.net', 'https://replace-custom-domain.com']", // CSRF対策のための許可するオリジンのリスト（デプロイ後に手動で設定）
        },
      }
    );

    // Lambda関数にDynamoDBへのアクセス権限を付与
    table.grantReadWriteData(apiLambdaFunction);

    // Lambda関数にCognitoユーザープールへのアクセス権限を付与
    userPool.grant(
      apiLambdaFunction,
      "cognito-idp:AdminInitiateAuth", // 管理者権限での認証（ADMIN_USER_PASSWORD_AUTH）
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminSetUserPassword",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminGetUser",
      "cognito-idp:ListUsers",
      // 以下はMFA用
      "cognito-idp:AdminRespondToAuthChallenge", // 管理者権限での認証チャレンジ応答
      "cognito-idp:VerifySoftwareToken", // TOTPデバイス(認証アプリ)の検証
      "cognito-idp:AssociateSoftwareToken" // TOTPデバイスの関連付け
    );

    // API用のLambda関数URLを設定
    const apiLambdaFunctionUrl = apiLambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
    });

    const spaRoutingCf2Function = new cloudfront.Function(
      this,
      "SpaRoutingCf2Function",
      {
        functionName: `${envname}-spa-routing-function`,
        code: cloudfront.FunctionCode.fromFile({
          filePath: "cf_function/spa-routing.js",
        }),
        runtime: cloudfront.FunctionRuntime.JS_2_0,
      }
    );

    // CloudFrontディストリビューションを作成し、S3バケットとLambda関数URLをオリジンとして設定
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: envname,
      defaultBehavior: {
        origin:
          origins.S3BucketOrigin.withOriginAccessControl(staticSiteBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        functionAssociations: [
          {
            function: spaRoutingCf2Function,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      additionalBehaviors: {
        "/api/*": {
          origin:
            origins.FunctionUrlOrigin.withOriginAccessControl(
              apiLambdaFunctionUrl
            ),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      // TODO: CloudWatch Logsへのログ出力が機能追加したら有効化する
    });
  }
}
