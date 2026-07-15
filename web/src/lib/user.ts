export function hasNickname(name: string | null | undefined) {
  const trimmed = name?.trim();
  return Boolean(trimmed) && trimmed !== "게스트";
}
