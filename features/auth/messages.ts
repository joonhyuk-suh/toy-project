/** Turns a Supabase Auth error into a short Korean message for the form. */
export function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  switch (code) {
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 맞지 않아요.";
    case "user_already_exists":
    case "email_exists":
      return "이미 가입한 이메일이에요. 로그인해 주세요.";
    case "weak_password":
      return "비밀번호를 6자 이상으로 정해 주세요.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "요청이 많아요. 잠시 뒤에 다시 시도해 주세요.";
  }
  return error instanceof Error && error.message ? error.message : "문제가 생겼어요. 다시 시도해 주세요.";
}
