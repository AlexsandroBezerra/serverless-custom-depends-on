# serverless-custom-depends-on

[![serverless](http://public.serverless.com/badges/v2.svg)](http://www.serverless.com) 
[![npm version](https://badge.fury.io/js/serverless-custom-depends-on.svg)](https://badge.fury.io/js/serverless-custom-depends-on) 

Serverless v2/v3 plugin to add custom dependsOn to CloudFormation resouces.

## What it does
It helps you to add the "DependsOn" attribute in your CloudFormation Template Resouces. That's an alternative when the CloudFormation throws the ˜Too many requests" error when trying to deploy your application.

## Install

```sh
npm install -D serverless-custom-depends-on
# or
yarn add -D serverless-custom-depends-on
```

## Enable the plugin

Add the following plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-custom-depends-on
```

## Configure

You can configure the plugin behavior using the `custom` section in your `serverless.yml` file.

You need to list which AWS Resources you want to add the "DependsOn" attribute. See in the example below:

```yaml
custom:
  serverless-custom-depends-on:
    - AWS::ApiGateway::Method
    - AWS::ApiGateway::Resource
```
