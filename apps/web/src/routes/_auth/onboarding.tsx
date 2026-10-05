import { Button } from "@auto-friend/ui/components/button";
import { Input } from "@auto-friend/ui/components/input";
import { cn } from "@auto-friend/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageContainer } from "@/components/app-shell";
import Loader from "@/components/loader";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/onboarding")({
  component: OnboardingPage,
  beforeLoad: async ({ context }) => {
    const mine = await context.queryClient.fetchQuery(context.trpc.agent.getMine.queryOptions());
    if (mine) throw redirect({ to: "/home" });
  },
});

type Gender = "male" | "female" | "other";

const STEPS = ["基本情報", "これまでのこと", "10の質問"] as const;

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-full border px-4 text-sm font-medium transition-colors",
        selected
          ? "border-foreground bg-foreground text-background"
          : "bg-background hover:bg-muted",
      )}
    >
      {selected && <Check className="-ml-1 size-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-input bg-muted/60 pr-10 pl-3.5 text-base outline-none transition-colors focus-visible:border-foreground/30 focus-visible:bg-background md:text-sm",
            !value && "text-muted-foreground",
          )}
        >
          <option value="">選択してください</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </Field>
  );
}

// 画面下に固定する「戻る / 次へ」のボタン列
function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-4 flex gap-2 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
      {children}
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const options = useQuery(trpc.agent.getOnboardingOptions.queryOptions());
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [romanticPreference, setRomanticPreference] = useState<Gender[]>([]);
  const [birthDate, setBirthDate] = useState("");
  const [birthplace, setBirthplace] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [club, setClub] = useState("");
  const [circle, setCircle] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const create = useMutation(
    trpc.agent.create.mutationOptions({
      onSuccess: async (result) => {
        queryClient.removeQueries();
        toast.success(
          `${displayName}が世界に参加しました！ さっそく${result.welcomeEventCount}件の出来事が起きています`,
        );
        await navigate({ to: "/home" });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  if (!options.data) return <Loader />;
  const data = options.data;

  const step1Valid =
    displayName.trim().length > 0 &&
    gender !== "" &&
    romanticPreference.length > 0 &&
    birthDate !== "";
  const step2Valid =
    birthplace && schoolType && club && circle && hobbies.length >= 3 && hobbies.length <= 8;
  const step3Valid = data.questions.every((q) => answers[q.id]);

  const submit = () => {
    if (gender === "") return;
    create.mutate({
      displayName: displayName.trim(),
      gender,
      romanticPreference,
      birthDate,
      birthplace: birthplace as never,
      schoolType: schoolType as never,
      club: club as never,
      circle: circle as never,
      hobbies: hobbies as never,
      answers,
    });
  };

  return (
    <PageContainer className="max-w-[560px]">
      <div className="px-4 pt-5 pb-2">
        <ol className="flex gap-1" aria-label="進み具合">
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= step ? "bg-foreground" : "bg-muted",
              )}
            >
              <span className="sr-only">{label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] font-semibold text-muted-foreground">
          ステップ {step + 1}/{STEPS.length} ・ {STEPS[step]}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">あなたのエージェントを作る</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          自己紹介文はいりません。選ぶだけで、あなたらしいエージェントが生まれます。
        </p>
      </div>

      {step === 0 && (
        <div className="space-y-6 px-4 pt-4">
          <Field label="エージェントの名前" hint="12文字まで">
            <Input
              aria-label="エージェントの名前"
              value={displayName}
              maxLength={12}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: ハル"
            />
          </Field>
          <Field label="性別">
            <div className="flex flex-wrap gap-2">
              {data.genders.map((g) => (
                <Chip
                  key={g.value}
                  selected={gender === g.value}
                  onClick={() => setGender(g.value)}
                >
                  {g.label}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="恋愛対象" hint="複数選べます">
            <div className="flex flex-wrap gap-2">
              {data.genders.map((g) => (
                <Chip
                  key={g.value}
                  selected={romanticPreference.includes(g.value)}
                  onClick={() =>
                    setRomanticPreference((current) =>
                      current.includes(g.value)
                        ? current.filter((v) => v !== g.value)
                        : [...current, g.value],
                    )
                  }
                >
                  {g.label}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="生年月日" hint="18歳以上の方のみ">
            <Input
              aria-label="生年月日"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </Field>
          <ActionBar>
            <Button size="lg" className="flex-1" disabled={!step1Valid} onClick={() => setStep(1)}>
              次へ
            </Button>
          </ActionBar>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 px-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="出身"
              value={birthplace}
              options={data.prefectures}
              onChange={setBirthplace}
            />
            <Select
              label="通っていた学校"
              value={schoolType}
              options={data.schoolTypes}
              onChange={setSchoolType}
            />
            <Select label="部活" value={club} options={data.clubs} onChange={setClub} />
            <Select label="サークル" value={circle} options={data.circles} onChange={setCircle} />
          </div>
          <Field label="好きなこと・趣味" hint={`3〜8個（${hobbies.length}個選択中）`}>
            <div className="flex flex-wrap gap-2">
              {data.hobbies.map((hobby) => (
                <Chip
                  key={hobby}
                  selected={hobbies.includes(hobby)}
                  onClick={() =>
                    setHobbies((current) =>
                      current.includes(hobby)
                        ? current.filter((h) => h !== hobby)
                        : current.length >= 8
                          ? current
                          : [...current, hobby],
                    )
                  }
                >
                  {hobby}
                </Chip>
              ))}
            </div>
          </Field>
          <ActionBar>
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(0)}>
              戻る
            </Button>
            <Button size="lg" className="flex-1" disabled={!step2Valid} onClick={() => setStep(2)}>
              次へ
            </Button>
          </ActionBar>
        </div>
      )}

      {step === 2 && (
        <div className="pt-2">
          {data.questions.map((question, index) => (
            <section key={question.id} className="border-b px-4 py-5 last-of-type:border-b-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Q{index + 1}/{data.questions.length}
              </p>
              <h2 className="mt-1 mb-3 text-[15px] leading-snug font-bold">{question.text}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={answers[question.id] === option.id}
                    onClick={() =>
                      setAnswers((current) => ({ ...current, [question.id]: option.id }))
                    }
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      answers[question.id] === option.id
                        ? "border-foreground bg-muted font-semibold"
                        : "hover:bg-muted/60",
                    )}
                  >
                    {option.label}
                    {answers[question.id] === option.id && (
                      <Check className="size-4 shrink-0" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
          <div className="px-4">
            <ActionBar>
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>
                戻る
              </Button>
              <Button
                size="lg"
                className="flex-[2]"
                disabled={!step3Valid || create.isPending}
                onClick={submit}
              >
                {create.isPending ? "世界に送り出しています..." : "この子を世界に送り出す"}
              </Button>
            </ActionBar>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
