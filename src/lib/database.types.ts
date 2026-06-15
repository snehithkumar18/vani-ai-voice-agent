export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  plan: "free" | "starter" | "growth" | "enterprise";
  calls_used_today: number;
  calls_limit: number;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  business_type: string;
  language: string;
  description: string | null;
  voice_type: string;
  status: "active" | "paused" | "draft";
  phone_number: string | null;
  calls_handled: number;
  success_rate: number;
  avg_duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  agent_id: string | null;
  user_id: string;
  caller_number: string | null;
  caller_name: string | null;
  duration_seconds: number;
  status: "active" | "completed" | "dropped" | "missed";
  intent: string | null;
  sentiment: "positive" | "neutral" | "negative" | "delighted";
  transcript: string | null;
  recording_url: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface PhoneNumber {
  id: string;
  user_id: string;
  agent_id: string | null;
  number: string;
  country_code: string;
  provider: string;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  user_id: string;
  total_agents: number;
  active_agents: number;
  total_calls: number;
  avg_duration_seconds: number | null;
  satisfaction_score: number | null;
}

export type NewAgent = Pick<
  Agent,
  "name" | "business_type" | "language" | "description" | "voice_type"
> &
  Partial<Pick<Agent, "status" | "phone_number">>;

export type AgentUpdate = Partial<
  Omit<Agent, "id" | "user_id" | "created_at" | "updated_at">
>;
