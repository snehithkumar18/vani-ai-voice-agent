import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Agent,
  AgentUpdate,
  Call,
  DashboardStats,
  NewAgent,
  Profile,
} from "@/lib/database.types";

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return data.user.id;
}

// ----- Profile -----
export function useProfile(options?: Partial<UseQueryOptions<Profile>>) {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const uid = await currentUserId();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    ...options,
  });
}

// ----- Agents -----
export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Agent[];
    },
  });
}

export function useAgent(id: string | undefined) {
  return useQuery<Agent>({
    queryKey: ["agents", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Agent;
    },
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewAgent) => {
      const uid = await currentUserId();
      const { data, error } = await supabase
        .from("agents")
        .insert({ ...input, user_id: uid })
        .select()
        .single();
      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: AgentUpdate }) => {
      const { data, error } = await supabase
        .from("agents")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Agent;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      qc.invalidateQueries({ queryKey: ["agents", vars.id] });
    },
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ----- Calls -----
export function useCalls(agentId?: string) {
  return useQuery<Call[]>({
    queryKey: ["calls", agentId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("calls")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(100);
      if (agentId) q = q.eq("agent_id", agentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Call[];
    },
  });
}

// ----- Dashboard stats -----
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const uid = await currentUserId();
      const { data, error } = await supabase
        .from("dashboard_stats")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      return (
        (data as DashboardStats | null) ?? {
          user_id: uid,
          total_agents: 0,
          active_agents: 0,
          total_calls: 0,
          avg_duration_seconds: 0,
          satisfaction_score: 0,
        }
      );
    },
  });
}
