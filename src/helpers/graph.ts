import Graph from 'graph-data-structure'

export function resourceListToGraph (
  resources: Serverless.CfnResourceList
): ReturnType<typeof Graph> {
  const graph = Graph()

  Object.keys(resources).forEach((name) => {
    graph.addNode(name)
  })

  const nodes = graph.nodes()

  Object.entries(resources).forEach(([name, resource]) => {
    if (resource.DependsOn) {
      const dependsOn =
          Array.isArray(resource.DependsOn) ? resource.DependsOn : [resource.DependsOn]

      dependsOn.forEach((dep) => {
        if (nodes.includes(dep)) {
          graph.addEdge(name, dep)
        }
      })
    }
  })

  return graph
}

export function getTails (graph: ReturnType<typeof Graph>): string[] {
  const tails: string[] = []

  graph.nodes().forEach((node) => {
    if (graph.outdegree(node) === 0) {
      tails.push(node)
    }
  })

  return tails
}

export function getHeads (graph: ReturnType<typeof Graph>): string[] {
  const heads: string[] = []

  graph.nodes().forEach((node) => {
    if (graph.indegree(node) === 0) {
      heads.push(node)
    }
  })

  return heads
}
