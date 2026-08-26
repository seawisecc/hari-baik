import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { runWarigaSelfTest } from "@/lib/wariga";

export const metadata = { title: "Debug Wariga — Hari Baik" };

export default function DebugWarigaPage() {
  const results = runWarigaSelfTest();
  const passed = results.filter((r) => r.pass).length;

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Card elevation={3}>
        <CardHeader>
          <CardTitle>Uji Engine Wariga</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            {passed}/{results.length} tes lolos
          </p>
        </CardHeader>
        <CardBody className="space-y-1.5">
          {results.map((r) => (
            <div
              key={r.test}
              className="flex items-center justify-between gap-4 rounded-sm px-3 py-1.5 text-sm"
            >
              <span className={r.pass ? "text-ink-soft" : "text-ink"}>{r.test}</span>
              <span
                className={r.pass ? "shrink-0 text-success" : "shrink-0 font-medium text-error"}
              >
                {r.pass ? "lolos" : `gagal → ${String(r.actual)}`}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
    </main>
  );
}
