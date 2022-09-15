// Original code from https://github.com/serverless/serverless-plugin-typescript/blob/master/src/Serverless.d.ts
declare namespace Serverless {
  interface Instance {
    cli: {
      log(str: string): void
    }

    config: {
      servicePath: string
    }

    service: {
      provider: {
        name: string
        compiledCloudFormationTemplate: CloudFormationTemplate
      }
      functions: {
        [key: string]: Serverless.Function
      }
      package: Serverless.Package
      getAllFunctions(): string[]
      custom?: {
        'serverless-custom-depends-on'?: string[]
      }
    }

    pluginManager: PluginManager
  }

  type CfnResourceList = {
    [key: string]: CfnResource
  }

  interface CloudFormationTemplate {
    Resources: CfnResourceList
  }

  type CfnResourceType = string

  interface CfnResource {
    Type: CfnResourceType
    Properties: {}
    DependsOn?: string[]
  }

  interface Options {
    function?: string
    watch?: boolean
    extraServicePath?: string
  }

  interface Function {
    handler: string
    package: Serverless.Package
  }

  interface Package {
    include: string[]
    exclude: string[]
    patterns: string[]
    artifact?: string
    individually?: boolean
  }

  type CommandsDefinition = Record<
      string,
      {
        lifecycleEvents?: string[]
        commands?: CommandsDefinition
        usage?: string
        options?: {
          [name: string]: {
            type: string
            usage: string
            required?: boolean
            shortcut?: string
          }
        }
      }
      >

  interface PluginManager {
    spawn(command: string): Promise<void>
  }
}