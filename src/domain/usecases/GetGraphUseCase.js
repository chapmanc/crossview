export class GetGraphUseCase {
  constructor(kubernetesRepository) {
    this.kubernetesRepository = kubernetesRepository;
  }

  async execute(context = null) {
    const graph = await this.kubernetesRepository.getGraph(context);
    return {
      nodes: Array.isArray(graph?.nodes) ? graph.nodes : [],
      edges: Array.isArray(graph?.edges) ? graph.edges : [],
      warnings: Array.isArray(graph?.warnings) ? graph.warnings : [],
    };
  }
}
