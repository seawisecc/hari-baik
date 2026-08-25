import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getWarigaDay, toDateString } from "@/lib/wariga";

export default function Home() {
  const today = getWarigaDay(toDateString(new Date()));

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-5xl font-bold italic text-ink">Hari Baik</h1>
          <p className="mt-2 text-ink-soft">
            Setiap orang punya waktunya masing-masing.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Card elevation={3}>
        <CardHeader>
          <CardTitle>Wariga hari ini</CardTitle>
          <p className="mt-1 text-sm text-ink-faint">{today.date}</p>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            {[
              ["Saptawara", today.saptaWara],
              ["Pancawara", today.pancaWara],
              ["Wuku", today.wuku],
              ["Sasih", today.sasih],
              ["Penanggal", today.lunarDay],
              ["Urip", String(today.uripTotal)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-ink-faint">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/styleguide">
          <Button>Lihat Styleguide</Button>
        </Link>
        <Link href="/debug-wariga">
          <Button variant="surface">Uji Engine Wariga</Button>
        </Link>
      </div>
    </main>
  );
}
