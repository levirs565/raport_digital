export function ruleNotEmpty(value: string) {
  if (value && value.length > 0) return true;
  return "Tidak boleh kosong";
}
