/** Menjalankan self-test engine sebagai bagian dari `npm run test`. */
import { runWarigaSelfTest } from "../wariga";

const results = runWarigaSelfTest();
const failed = results.filter((r) => !r.pass);
failed.forEach((f) =>
  console.log("FAIL:", f.test, "| expected", f.expected, "| got", f.actual),
);
console.log(
  failed.length === 0
    ? `✓ wariga: ${results.length}/${results.length} lolos`
    : `✗ wariga: ${failed.length} gagal`,
);
if (failed.length) process.exit(1);
