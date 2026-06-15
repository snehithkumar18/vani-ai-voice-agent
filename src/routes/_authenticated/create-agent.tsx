import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/vani-ui/Button";
import { Input } from "@/components/vani-ui/Input";
import { Icon } from "@/components/vani-ui/Icon";
import { useCreateAgent } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/create-agent")({
  component: CreateAgentPage,
});

const BUSINESS_TYPES = [
  "Real Estate",
  "Banking & Finance",
  "Healthcare",
  "Retail/E-commerce",
  "Customer Support",
  "Automobile",
  "Education",
  "Hospitality",
];

const LANGUAGES = [
  { flag: "🇮🇳", label: "Hindi" },
  { flag: "🇮🇳", label: "Telugu" },
  { flag: "🇮🇳", label: "Tamil" },
  { flag: "🇮🇳", label: "Kannada" },
  { flag: "🇮🇳", label: "Bengali" },
  { flag: "🇮🇳", label: "Marathi" },
  { flag: "🇺🇸", label: "English (Indian Accent)" },
];

const VOICE_OPTIONS = [
  {
    id: "Female - Warm & Professional",
    icon: "record_voice_over",
    title: "Female - Warm & Professional",
    sub: "Natural, friendly tone for customer support",
    disabled: false,
  },
  {
    id: "Male - Formal & Confident",
    icon: "record_voice_over",
    title: "Male - Formal & Confident",
    sub: "Professional tone for enterprise calls",
    disabled: false,
  },
  {
    id: "Custom Voice Clone",
    icon: "auto_awesome",
    title: "Custom Voice Clone",
    sub: "Upload a voice sample to clone",
    disabled: true,
  },
];

const RESPONSE_STYLES = ["Friendly & Casual", "Professional", "Empathetic"];

const STEPS = ["Business Info", "Agent Setup", "Phone Number"];

type FormData = {
  name: string;
  businessType: string;
  language: string;
  description: string;
  voiceType: string;
  knowledgeBase: string;
  responseStyle: string;
  escalation: string;
  phoneOption: "indian" | "own" | "";
};

function CreateAgentPage() {
  const navigate = useNavigate();
  const createAgent = useCreateAgent();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessType: "",
    language: "Hindi",
    description: "",
    voiceType: "Female - Warm & Professional",
    knowledgeBase: "",
    responseStyle: "Professional",
    escalation: "",
    phoneOption: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [numberAssigned, setNumberAssigned] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: false }));
  };

  const validateStep = (s: number): string[] => {
    const bad: string[] = [];
    if (s === 1) {
      if (formData.name.trim().length < 3) bad.push("name");
      if (!formData.businessType) bad.push("businessType");
      if (!formData.language) bad.push("language");
    }
    if (s === 2) {
      if (!formData.voiceType) bad.push("voiceType");
    }
    if (s === 3) {
      if (!formData.phoneOption) bad.push("phoneOption");
    }
    return bad;
  };

  const triggerShake = () => setShake((n) => n + 1);

  const handleNext = () => {
    const bad = validateStep(step);
    if (bad.length) {
      setErrors(Object.fromEntries(bad.map((k) => [k, true])));
      triggerShake();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate({ to: "/dashboard" });
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    const bad = validateStep(3);
    if (bad.length) {
      setErrors(Object.fromEntries(bad.map((k) => [k, true])));
      triggerShake();
      return;
    }
    try {
      await createAgent.mutateAsync({
        name: formData.name.trim(),
        business_type: formData.businessType,
        language: formData.language,
        description: formData.description || null,
        voice_type: formData.voiceType,
        status: "active",
        phone_number:
          formData.phoneOption === "indian" ? "+91 80 4567 8901" : null,
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create agent");
    }
  };

  const filledWidth = useMemo(
    () => (step === 1 ? "0%" : step === 2 ? "50%" : "100%"),
    [step],
  );

  return (
    <DashboardLayout>
      <div className="overflow-y-auto bg-background pb-16">
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold text-primary">
            Create Your AI Agent
          </h1>
          <p className="text-on-surface-variant mt-2">
            Set up your intelligent voice agent in 3 simple steps.
          </p>
        </div>

        {/* Step indicator */}
        <div className="max-w-[560px] mx-auto mt-8 relative px-4">
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-border-subtle z-0" />
          <div
            className="absolute top-5 left-4 h-0.5 bg-secondary transition-all duration-500 z-0"
            style={{ width: `calc((100% - 2rem) * ${filledWidth.replace("%", "") }/100)` }}
          />
          <div className="flex justify-between relative z-10">
            {STEPS.map((label, i) => {
              const num = i + 1;
              const completed = num < step;
              const active = num === step;
              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      completed
                        ? "bg-secondary text-white"
                        : active
                        ? "bg-secondary text-white ring-4 ring-secondary/20"
                        : "bg-white border-2 border-border-subtle text-outline"
                    }`}
                  >
                    {completed ? (
                      <Icon name="check" className="text-[20px]" />
                    ) : (
                      num
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      active || completed ? "text-secondary" : "text-outline"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <motion.div
          key={shake}
          animate={shake > 0 ? { x: [0, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="max-w-[700px] mx-auto mt-8 bg-white border border-border-subtle rounded-xl p-8 shadow-[0px_4px_24px_rgba(30,27,75,0.06)]"
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-secondary mb-6">
            Step {step} of 3
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <Input
                    label="Agent Name"
                    placeholder="Priya - Customer Support"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    error={errors.name ? "Name must be at least 3 characters" : undefined}
                  />
                  <p className="text-xs text-outline mt-1">
                    Give your agent a professional name (e.g., 'Priya - Customer Support')
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldLabel label="Business Type">
                    <SelectField
                      value={formData.businessType}
                      onChange={(v) => update("businessType", v)}
                      placeholder="Select type"
                      options={BUSINESS_TYPES}
                      error={errors.businessType}
                    />
                  </FieldLabel>
                  <FieldLabel label="Primary Language">
                    <SelectField
                      value={formData.language}
                      onChange={(v) => update("language", v)}
                      options={LANGUAGES.map((l) => `${l.flag} ${l.label}`)}
                      valueMap={(v) => v.replace(/^[^\s]+\s/, "")}
                      displayMap={(v) => {
                        const found = LANGUAGES.find((l) => l.label === v);
                        return found ? `${found.flag} ${found.label}` : v;
                      }}
                      error={errors.language}
                    />
                  </FieldLabel>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-sm font-medium text-on-surface">
                      Business Description
                    </label>
                    <span
                      title="Help the AI understand what your business does and how it should respond"
                      className="text-outline cursor-help"
                    >
                      <Icon name="info" className="text-[16px]" />
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe what your business does..."
                    className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-white text-on-surface placeholder:text-outline focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all resize-none"
                  />
                  <div className="text-right text-xs text-outline mt-1">
                    {formData.description.length}/500
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-on-surface mb-1.5 block">
                    Quick Knowledge Base
                  </label>
                  <textarea
                    rows={4}
                    value={formData.knowledgeBase}
                    onChange={(e) => update("knowledgeBase", e.target.value)}
                    placeholder="Paste your FAQs, product catalog, pricing, business hours, or any information your agent should know..."
                    className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-white text-on-surface placeholder:text-outline focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-outline mt-1">
                    Optional — you can update this later from the agent settings.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="text-sm font-medium text-on-surface mb-3 block">
                    Voice Type
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {VOICE_OPTIONS.map((v) => {
                      const selected = formData.voiceType === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={v.disabled}
                          onClick={() => !v.disabled && update("voiceType", v.id)}
                          className={`text-left flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selected
                              ? "border-secondary bg-secondary-fixed/10"
                              : "border-border-subtle hover:border-secondary/40"
                          } ${v.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <Icon
                            name={v.icon}
                            className="text-[28px] text-secondary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-on-surface flex items-center gap-2">
                              {v.title}
                              {v.disabled && (
                                <span className="text-[10px] uppercase tracking-wider bg-surface-container-low text-outline px-2 py-0.5 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-on-surface-variant">
                              {v.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-on-surface mb-3 block">
                    Response Style
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {RESPONSE_STYLES.map((s) => {
                      const selected = formData.responseStyle === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => update("responseStyle", s)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition-all ${
                            selected
                              ? "bg-secondary text-white border-secondary"
                              : "border-border-subtle text-on-surface-variant hover:border-secondary/40"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Escalation Trigger"
                  placeholder="Transfer to human after 3 failed attempts or if user says 'agent'"
                  value={formData.escalation}
                  onChange={(e) => update("escalation", e.target.value)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-secondary-fixed/20 border border-secondary/20 rounded-xl p-4 flex gap-3">
                  <Icon name="info" className="text-secondary text-[20px]" />
                  <p className="text-sm text-on-surface-variant">
                    A phone number will be assigned to your agent. You can use it immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PhoneCard
                    selected={formData.phoneOption === "indian"}
                    onClick={() => update("phoneOption", "indian")}
                    icon="phone"
                    title="Get an Indian Number"
                    primary="+91 XXXXXXXX"
                    sub="₹499/month included in your plan"
                    error={errors.phoneOption}
                  />
                  <PhoneCard
                    selected={formData.phoneOption === "own"}
                    onClick={() => update("phoneOption", "own")}
                    icon="settings_phone"
                    title="Use My Own Number"
                    primary="Connect Plivo/Twilio"
                    sub="Requires API keys"
                    error={errors.phoneOption}
                  />
                </div>

                {formData.phoneOption === "indian" && (
                  <Button
                    fullWidth
                    onClick={() => setNumberAssigned(true)}
                    disabled={numberAssigned}
                    iconLeft={
                      numberAssigned ? (
                        <Icon name="check_circle" className="text-[20px]" />
                      ) : undefined
                    }
                    className={numberAssigned ? "!bg-emerald-600" : ""}
                  >
                    {numberAssigned
                      ? "+91 80 4567 8901 assigned"
                      : "Assign Number"}
                  </Button>
                )}

                <div className="mt-6 bg-surface-container-low rounded-xl p-5">
                  <div className="font-semibold text-sm text-primary mb-4">
                    Agent Summary
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <SummaryRow label="Agent Name" value={formData.name || "—"} />
                    <SummaryRow label="Language" value={formData.language} />
                    <SummaryRow label="Voice" value={formData.voiceType} />
                    <SummaryRow
                      label="Business"
                      value={formData.businessType || "—"}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-subtle">
            <Button variant="ghost" onClick={handleBack}>
              {step === 1 ? "Cancel" : "← Back"}
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} iconRight={<span>→</span>}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createAgent.isPending || submitSuccess}
                className={submitSuccess ? "!bg-emerald-600" : ""}
                iconLeft={
                  submitSuccess ? (
                    <Icon name="check" className="text-[20px]" />
                  ) : undefined
                }
              >
                {submitSuccess
                  ? "Agent Created!"
                  : createAgent.isPending
                  ? "Creating..."
                  : "Create Agent ⚡"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-on-surface mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  error,
  valueMap,
  displayMap,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
  valueMap?: (v: string) => string;
  displayMap?: (v: string) => string;
}) {
  return (
    <div className="relative">
      <select
        value={displayMap ? displayMap(value) : value}
        onChange={(e) =>
          onChange(valueMap ? valueMap(e.target.value) : e.target.value)
        }
        className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg border bg-white text-on-surface focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all ${
          error ? "border-error" : "border-border-subtle"
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]"
      />
    </div>
  );
}

function PhoneCard({
  selected,
  onClick,
  icon,
  title,
  primary,
  sub,
  error,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  primary: string;
  sub: string;
  error?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-xl border-2 transition-all ${
        selected
          ? "border-secondary bg-secondary-fixed/10"
          : error
          ? "border-error"
          : "border-border-subtle hover:border-secondary/40"
      }`}
    >
      <Icon name={icon} className="text-[28px] text-secondary" />
      <div className="font-semibold text-on-surface mt-2">{title}</div>
      <div className="text-sm text-on-surface-variant mt-1">{primary}</div>
      <div className="text-xs text-outline mt-1">{sub}</div>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-outline uppercase tracking-wide">{label}</div>
      <div className="text-on-surface font-medium truncate">{value}</div>
    </div>
  );
}
