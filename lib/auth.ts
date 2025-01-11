export function isValidPass(pass: string) {
  if (!process.env.PASS) {
    throw new Error("No password set via PASS env var");
  }

  return pass === process.env.PASS;
}
