/** A Better Auth client error (`{ code, message, status }`). */
export class AuthError extends Error {
  override readonly name = "AuthError"
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

