-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_base
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create HNSW index for cosine distance searches
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON public.knowledge_base 
USING hnsw (embedding vector_cosine_ops);

-- Create similarity matching function
CREATE OR REPLACE FUNCTION public.match_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_agent_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE kb.agent_id = p_agent_id
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Secure the function permissions
REVOKE EXECUTE ON FUNCTION public.match_knowledge(vector, float, int, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_knowledge(vector, float, int, uuid) TO authenticated;
