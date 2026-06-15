export async function triggerOutboundCall(agentId: string, phoneNumber: string, userId: string) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/api/calls/outbound`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      phone_number: phoneNumber,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to trigger outbound call");
  }

  return res.json();
}
