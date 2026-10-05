import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
