export type VerificationGrade = "A" | "B" | "C" | "D";

export type VerificationBadgeInfo = {
  verified: boolean;
  grade: VerificationGrade;
  verifierName: string;
  method: string;
  summary: string;
  verificationCount: number;
};
