import Graph from 'graph-data-structure';

export class GraphHelper {
  public static resouceListToGraph(
    resources: Serverless.CfnResourceList
  ): ReturnType<typeof Graph> {
    const graph = Graph();

    Object.entries(resources).forEach(([name, resource]) => {
      graph.addNode(name);

      if (resource.DependsOn) {
        const dependsOn =
          Array.isArray(resource.DependsOn) ? resource.DependsOn : [resource.DependsOn];

        dependsOn.forEach((dep) => {
          graph.addEdge(name, dep);
        });
      }
    });

    return graph;
  }

  public static getTails(graph: ReturnType<typeof Graph>): string[] {
    const tails = [];

    graph.nodes().forEach((node) => {
      if (graph.outdegree(node) === 0) {
        tails.push(node);
      }
    });

    return tails;
  }

  public static getHeads(graph: ReturnType<typeof Graph>): string[] {
    const heads = [];

    graph.nodes().forEach((node) => {
      if (graph.indegree(node) === 0) {
        heads.push(node);
      }
    });

    return heads;
  }
}