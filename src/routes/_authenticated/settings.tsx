import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Icon } from "@/components/vani-ui/Icon";
import { Button } from "@/components/vani-ui/Button";
import { useProfile } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const profileQuery = useProfile();
  
  const [activeTab, setActiveTab] = useState<"profile" | "telephony" | "keys">("profile");

  const [sipTrunkId, setSipTrunkId] = useState("VOB-TRUNK-882");
  const [outboundNumber, setOutboundNumber] = useState("+91 80 4452 9001");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-on-surface-variant text-base mt-1">
          Manage your account configurations, API integrations, and telephony setups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle mb-6 gap-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "profile"
              ? "border-secondary text-secondary"
              : "border-transparent text-outline hover:text-primary"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon name="person" className="text-[18px]" /> Profile Account
          </span>
        </button>
        <button
          onClick={() => setActiveTab("telephony")}
          className={`pb-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "telephony"
              ? "border-secondary text-secondary"
              : "border-transparent text-outline hover:text-primary"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon name="dns" className="text-[18px]" /> Telephony (SIP)
          </span>
        </button>
        <button
          onClick={() => setActiveTab("keys")}
          className={`pb-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer ${
            activeTab === "keys"
              ? "border-secondary text-secondary"
              : "border-transparent text-outline hover:text-primary"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon name="key" className="text-[18px]" /> API & Secret Keys
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="max-w-2xl bg-white border border-border-subtle rounded-xl p-8 shadow-sm">
        {activeTab === "profile" && (
          <div>
            <h3 className="text-lg font-bold text-primary mb-6">Profile Settings</h3>
            {profileQuery.isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-surface-container-high rounded" />
                <div className="h-10 bg-surface-container-high rounded" />
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                    User ID Reference
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profileQuery.data?.id || ""}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent text-sm text-outline font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                      Account Subscription
                    </label>
                    <div className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent text-sm text-primary font-semibold capitalize">
                      {profileQuery.data?.subscription_tier || "Enterprise Plan"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                      Usage Active Status
                    </label>
                    <div className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "telephony" && (
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-lg font-bold text-primary mb-6">SIP Trunking Configurations</h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                Vobiz / Plivo SIP Trunk ID
              </label>
              <input
                type="text"
                value={sipTrunkId}
                onChange={(e) => setSipTrunkId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none text-sm text-primary font-medium transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                Outbound Calling Number
              </label>
              <input
                type="text"
                value={outboundNumber}
                onChange={(e) => setOutboundNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none text-sm text-primary font-medium transition-all"
                required
              />
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button type="submit">Save Telephony Config</Button>
              {isSaved && (
                <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                  <Icon name="check_circle" className="text-[18px]" /> Saved successfully!
                </span>
              )}
            </div>
          </form>
        )}

        {activeTab === "keys" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary mb-6">Integrations & API Secrets</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                  LiveKit Project Server URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    value="wss://vani-voice-platform.livekit.cloud"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent text-sm text-outline font-mono"
                  />
                  <button className="p-2 border border-border-subtle rounded-lg hover:bg-surface-container-low" title="Copy URL">
                    <Icon name="content_copy" className="text-[18px] text-outline" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                  Deepgram STT API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    disabled
                    value="dg_secret_key_placeholder_configured"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent text-sm text-outline font-mono"
                  />
                  <button className="p-2 border border-border-subtle rounded-lg hover:bg-surface-container-low" title="Show Key">
                    <Icon name="visibility" className="text-[18px] text-outline" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                  Groq LLM API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    disabled
                    value="groq_llama33_secret_key_placeholder"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low border border-transparent text-sm text-outline font-mono"
                  />
                  <button className="p-2 border border-border-subtle rounded-lg hover:bg-surface-container-low" title="Show Key">
                    <Icon name="visibility" className="text-[18px] text-outline" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
