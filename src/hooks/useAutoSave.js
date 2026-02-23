import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AUTOSAVE_DELAY = 2000; // 2 seconds after last change

export const useAutoSave = (nodes, edges, setNodes, setEdges, user) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentDiagramId, setCurrentDiagramId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const timeoutRef = useRef(null);
  const lastSaveRef = useRef(null);

  // Load diagram on mount
  useEffect(() => {
    if (!user || loaded) return;

    const loadDiagram = async () => {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, that's fine for new users
        console.error('Error loading diagram:', error);
        setLoaded(true);
        return;
      }

      if (data) {
        setCurrentDiagramId(data.id);
        setLastSaved(new Date(data.updated_at));
        // Update nodes and edges with loaded data
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setLoaded(true);
      } else {
        // Create first diagram for new user
        const { data: newDiagram, error: createError } = await supabase
          .from('diagrams')
          .insert({
            user_id: user.id,
            name: 'My First Diagram',
            nodes: [],
            edges: [],
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating diagram:', createError);
          setLoaded(true);
          return;
        }

        setCurrentDiagramId(newDiagram.id);
        setLastSaved(new Date(newDiagram.updated_at));
        setLoaded(true);
      }
    };

    loadDiagram();
  }, [user, loaded, setNodes, setEdges]);

  // Auto-save on changes (only after initial load)
  const saveDiagram = useCallback(async () => {
    if (!user || !currentDiagramId || !loaded) return;

    const payload = { nodes, edges };
    const payloadStr = JSON.stringify(payload);

    // Don't save if nothing changed
    if (payloadStr === lastSaveRef.current) return;
    lastSaveRef.current = payloadStr;

    setSaving(true);

    const { error } = await supabase
      .from('diagrams')
      .update({
        nodes,
        edges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentDiagramId);

    if (error) {
      console.error('Error saving diagram:', error);
    } else {
      setLastSaved(new Date());
    }

    setSaving(false);
  }, [nodes, edges, user, currentDiagramId, loaded]);

  // Debounced save on every change
  useEffect(() => {
    if (!user || !currentDiagramId || !loaded) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      saveDiagram();
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nodes, edges, user, currentDiagramId, loaded, saveDiagram]);

  return { saving, lastSaved, loaded };
};