import LoginTemplate from "@modules/account/templates/login-template"

/**
 * Fallback for the @login parallel-route slot so that any /account/* path
 * (e.g. /account/wholesale) renders the login screen when the visitor is not
 * authenticated, instead of a 404.
 */
export default function LoginDefault() {
  return <LoginTemplate />
}
