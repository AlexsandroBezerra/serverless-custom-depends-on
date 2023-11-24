import type Graph from 'graph-data-structure'

import { filterResourcesByType } from './helpers/filter'
import { getHeads, getTails, resourceListToGraph } from './helpers/graph'

interface GraphSerialized {
  nodes: Array<{ id: string }>
  links: Array<{ source: string, target: string }>
}

class Plugin {
  readonly pluginName = 'serverless-custom-depends-on'
  readonly serverless: Serverless.Instance
  readonly hooks: Record<string, () => void>

  constructor (serverless: Serverless.Instance) {
    this.serverless = serverless
    this.hooks = {
      'before:package:finalize': () => { this.execute() }
    }
  }

  log (message: string): void {
    this.serverless.cli.log(`[${this.pluginName}] ${message}`)
  }

  validate (): void {
    const settings = this.serverless.service.custom?.[this.pluginName]

    if (!this.serverless.service.provider.compiledCloudFormationTemplate) {
      throw new Error('This plugin needs access to the compiled CloudFormation template')
    } if (!settings) {
      throw new Error(`Missing custom.${this.pluginName} configuration`)
    } if (!Array.isArray(settings)) {
      throw new Error(`custom.${this.pluginName} must be an array`)
    } if (settings.some((item) => typeof item !== 'string')) {
      throw new Error(`custom.${this.pluginName} must be an array of string`)
    }
  }

  execute (): void {
    this.validate()

    const service = this.serverless.service
    const pluginConfig = service.custom?.[this.pluginName] as string[]
    const resources = service.provider.compiledCloudFormationTemplate.Resources

    this.log(`Resources to enabled DependsOn rule: ${pluginConfig.toString()}`)

    const dependenciesGraphsByType = pluginConfig.map((name) => {
      return resourceListToGraph(
        filterResourcesByType(resources, name)
      )
    })

    this.log('Resolving dependencies...')

    const resolvedDependenciesGraphs = dependenciesGraphsByType.map(dependenciesGraph => {
      return this.resolveDependencies(dependenciesGraph)
    })

    this.log('Adding DependsOn rule...')

    resolvedDependenciesGraphs.forEach((graph) => {
      this.addDependsOnRule(resources, graph.serialize())
    })
  }

  resolveDependencies (graph: ReturnType<typeof Graph>): ReturnType<typeof Graph> {
    do {
      const head = getHeads(graph)[0]

      for (const tail of getTails(graph)) {
        if (head && tail) {
          if (head !== tail) {
            if (!graph.hasEdge(head, tail)) {
              graph.addEdge(tail, head)

              if (graph.hasCycle()) {
                graph.removeEdge(tail, head)
              } else {
                break
              }
            }
          }
        }
      }
    } while (getHeads(graph).length > 1)

    return graph
  }

  addDependsOnRule (
    resourcesRef: Serverless.CfnResourceList,
    graph: GraphSerialized
  ): void {
    graph.links.forEach((link) => {
      const resource = resourcesRef[link.source]
      const dependsOn = new Set<string>()

      if (resource.DependsOn) {
        const dependsOnArray = Array.isArray(resource.DependsOn)
          ? resource.DependsOn
          : [resource.DependsOn]

        dependsOnArray.forEach((dep) => {
          dependsOn.add(dep)
        })
      }

      this.log(`Adding DependsOn rule to ${link.source} -> ${link.target}`)

      dependsOn.add(link.target)

      resource.DependsOn = Array.from(dependsOn)
    })
  }
}

module.exports = Plugin
