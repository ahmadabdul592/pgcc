export const formatRegNo = (seq: number) => `PGCC/KN/2027/${String(seq).padStart(5, "0")}`;
export const regNoToSlug = (r: string) => r.replaceAll("/", "-"); // PGCC-KN-2027-00001
export const slugToRegNo = (s: string) => s.replaceAll("-", "/");
