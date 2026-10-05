import { Button } from "@auto-friend/ui/components/button";
import { Input } from "@auto-friend/ui/components/input";
import { cn } from "@auto-friend/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Section } from "@/components/section";
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
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        selected ? "border-pink-500 bg-pink-500 text-white" : "bg-background hover:bg-muted",
      )}
    >
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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
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
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">選択してください</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
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
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold">あなたのエージェントを作る</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          自己紹介文はいりません。選ぶだけで、あなたらしいエージェントが生まれます。
        </p>
      </div>
      <ol className="flex gap-2 text-xs">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex-1 rounded-full border px-3 py-1 text-center",
              index === step
                ? "border-pink-500 font-semibold text-pink-600"
                : "text-muted-foreground",
            )}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Section className="space-y-5">
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
          <Button className="w-full" disabled={!step1Valid} onClick={() => setStep(1)}>
            次へ
          </Button>
        </Section>
      )}

      {step === 1 && (
        <Section className="space-y-5">
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
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
              戻る
            </Button>
            <Button className="flex-1" disabled={!step2Valid} onClick={() => setStep(2)}>
              次へ
            </Button>
          </div>
        </Section>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {data.questions.map((question, index) => (
            <Section key={question.id} title={`Q${index + 1}. ${question.text}`}>
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
                      "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      answers[question.id] === option.id
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/40"
                        : "hover:bg-muted",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Section>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              戻る
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
              disabled={!step3Valid || create.isPending}
              onClick={submit}
            >
              {create.isPending ? "世界に送り出しています..." : "この子を世界に送り出す"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
