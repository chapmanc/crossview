import { useEffect, useState } from 'react';
import { GetGraphUseCase } from '../../domain/usecases/GetGraphUseCase.js';

const EMPTY_GRAPH = { nodes: [], edges: [], warnings: [] };

const contextNameOf = (context) => (typeof context === 'string' ? context : context.name || context);

export const useGraphData = (kubernetesRepository, selectedContext) => {
  const [graph, setGraph] = useState(EMPTY_GRAPH);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedContext) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await new GetGraphUseCase(kubernetesRepository).execute(contextNameOf(selectedContext));
        if (!cancelled) setGraph(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedContext, kubernetesRepository]);

  return { graph, loading, error };
};
