import { Label } from "@auto-friend/ui/components/label";
import { Input } from "@auto-friend/ui/components/input";

// ログイン・登録画面の共通レイアウト。フォームのカードと、切り替え導線のカードを縦に並べる。
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-[380px] flex-col gap-3 px-4 pt-10 pb-16 md:pt-16">
      <div className="rounded-2xl px-2 py-6 sm:border sm:px-10 sm:py-10">
        <p className="brand-text text-center text-4xl font-extrabold tracking-[-0.04em]">
          auto-friend
        </p>
        <h1 className="mt-5 text-center text-base font-bold">{title}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="rounded-2xl px-2 py-4 text-center text-sm sm:border">{footer}</div>
    </main>
  );
}

// プレースホルダーで項目名を見せる入力欄。ラベルはスクリーンリーダー向けに残す。
export function AuthField({
  field,
  label,
  type = "text",
  autoComplete,
}: {
  field: {
    name: string;
    state: { value: string; meta: { errors: ({ message?: string } | undefined)[] } };
    handleBlur: () => void;
    handleChange: (value: string) => void;
  };
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  const errors = field.state.meta.errors;
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name} className="sr-only">
        {label}
      </Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={label}
        autoComplete={autoComplete}
        aria-invalid={errors.length > 0 || undefined}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {errors.map((error) => (
        <p key={error?.message} className="px-1 text-xs text-destructive">
          {error?.message}
        </p>
      ))}
    </div>
  );
}
