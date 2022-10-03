interface CfnResourcePair {
  name: string;
  resource: Serverless.CfnResource;
}

class Plugin {
  readonly pluginName = 'serverless-custom-depends-on';
  readonly serverless: Serverless.Instance;
  readonly options: Serverless.Options;
  readonly commands: { [key: string]: any };
  readonly hooks: { [key: string]: Function };

  constructor(serverless: Serverless.Instance, options: Serverless.Options) {
    this.serverless = serverless;
    this.hooks = {
      'before:package:finalize': () => this.execute(),
    };
  }

  log(message: string) {
    this.serverless.cli.log(`[${this.pluginName}] ${message}`);
  }

  validate() {
    if (!this.serverless.service.provider.compiledCloudFormationTemplate) {
      throw new Error('This plugin needs access to the compiled CloudFormation template');
    }
  }

  filterResourcesByType(
    resources: Serverless.CfnResourceList, 
    type: Serverless.CfnResourceType
  ): CfnResourcePair[] {
    const filtered = Object.entries(resources).filter((obj: [string, Serverless.CfnResource]) => {
      const value = obj[1];
      return value.Type === type;
    });
    return filtered.map((obj) => {
      return {
        name: obj[0],
        resource: obj[1],
      };
    });
  }

  execute() {
    this.validate();
    const service = this.serverless.service;

    const pluginConfig = service.custom[this.pluginName];

    this.log(JSON.stringify(pluginConfig, null, 2));

    const template = service.provider.compiledCloudFormationTemplate;
    const resources = template.Resources;

    this.log(`resourcesToEnabledDependsOn: ${JSON.stringify(pluginConfig)}`);

    const validators = pluginConfig.map((name) => {
      return this.filterResourcesByType(resources, name)
    });

    validators.forEach((validator) => {
      this.addDependsOnRule(validator);
    });
  }

  addDependsOnRule(validatorsRefs: CfnResourcePair[]) {
    validatorsRefs.forEach((valilatorRef, index) => {
      const resource = valilatorRef.resource;
      const nextValidator = validatorsRefs[index + 1];
      this.log(`Adding DependsOn rule for ${valilatorRef.name}`);

      if (nextValidator) {
        let dependsOn = resource.DependsOn || [];

        if (Array.isArray(dependsOn)) {
          if (!dependsOn.includes(nextValidator.name)) {
            dependsOn.push(nextValidator.name);
          }
        } else {
          dependsOn = [dependsOn, nextValidator.name];
        }

        resource.DependsOn = dependsOn;
      }
    })
  }
}

module.exports = Plugin;
