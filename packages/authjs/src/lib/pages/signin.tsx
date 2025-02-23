import type {
  InternalProvider,
  SignInPageErrorParam,
  Theme,
} from "../../types.js"

const signinErrors: Record<
  Lowercase<SignInPageErrorParam | "default">,
  string
> = {
  default: "Unable to sign in.",
  signin: "Try signing in with a different account.",
  oauthsignin: "Try signing in with a different account.",
  oauthcallbackerror: "Try signing in with a different account.",
  oauthcreateaccount: "Try signing in with a different account.",
  emailcreateaccount: "Try signing in with a different account.",
  callback: "Try signing in with a different account.",
  oauthaccountnotlinked:
    "To confirm your identity, sign in with the same account you used originally.",
  emailsignin: "The e-mail could not be sent.",
  credentialssignin:
    "Sign in failed. Check the details you provided are correct.",
  sessionrequired: "Please sign in to access this page.",
}
function hexToRgba(hex?: string, alpha = 1) {
  if (!hex) {
    return
  }
  // Remove the "#" character if it's included
  hex = hex.replace(/^#/, "")

  // Expand 3-digit hex codes to their 6-digit equivalents
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // Parse the hex value to separate R, G, and B components
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  // Ensure the alpha value is within the valid range [0, 1]
  alpha = Math.min(Math.max(alpha, 0), 1)

  // Construct the RGBA string
  const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`

  return rgba
}

export default function SigninPage(props: {
  csrfToken: string
  providers: InternalProvider[]
  callbackUrl: string
  email: string
  error?: SignInPageErrorParam
  theme: Theme
}) {
  const {
    csrfToken,
    providers = [],
    callbackUrl,
    theme,
    email,
    error: errorType,
  } = props

  if (typeof document !== "undefined" && theme.brandColor) {
    document.documentElement.style.setProperty(
      "--brand-color",
      theme.brandColor
    )
  }

  if (typeof document !== "undefined" && theme.buttonText) {
    document.documentElement.style.setProperty(
      "--button-text-color",
      theme.buttonText
    )
  }

  const error =
    errorType &&
    (signinErrors[errorType.toLowerCase() as Lowercase<SignInPageErrorParam>] ??
      signinErrors.default)

  const providerLogoPath = "https://authjs.dev/img/providers"

  return (
    <div className="signin">
      {theme.brandColor && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {--brand-color: ${theme.brandColor}}`,
          }}
        />
      )}
      {theme.buttonText && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
        :root {
          --button-text-color: ${theme.buttonText}
        }
      `,
          }}
        />
      )}
      <div className="card">
        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}
        {theme.logo && <img src={theme.logo} alt="Logo" className="logo" />}
        {providers.map((provider, i) => {
          let bg, text, logo, logoDark, bgDark, textDark
          if (provider.type === "oauth" || provider.type === "oidc") {
            ;({
              bg = "",
              text = "",
              logo = "",
              bgDark = bg,
              textDark = text,
              logoDark = "",
            } = provider.style ?? {})

            logo = logo.startsWith("/") ? providerLogoPath + logo : logo
            logoDark = logoDark.startsWith("/")
              ? providerLogoPath + logoDark
              : logoDark || logo

            logoDark ||= logo
          }
          return (
            <div key={provider.id} className="provider">
              {provider.type === "oauth" || provider.type === "oidc" ? (
                <form action={provider.signinUrl} method="POST">
                  <input type="hidden" name="csrfToken" value={csrfToken} />
                  {callbackUrl && (
                    <input
                      type="hidden"
                      name="callbackUrl"
                      value={callbackUrl}
                    />
                  )}
                  <button
                    type="submit"
                    className="button"
                    style={{
                      "--provider-bg": bg,
                      "--provider-dark-bg": bgDark,
                      "--provider-color": text,
                      "--provider-dark-color": textDark,
                      "--provider-bg-hover": hexToRgba(bg, 0.8),
                      "--provider-dark-bg-hover": hexToRgba(bgDark, 0.8),
                    }}
                    tabIndex={0}
                  >
                    {logo && (
                      <img
                        loading="lazy"
                        height={24}
                        width={24}
                        id="provider-logo"
                        src={logo}
                      />
                    )}
                    {logoDark && (
                      <img
                        loading="lazy"
                        height={24}
                        width={24}
                        id="provider-logo-dark"
                        src={logoDark}
                      />
                    )}
                    <span>Sign in with {provider.name}</span>
                  </button>
                </form>
              ) : null}
              {["email", "credentials", "passkey"].some((t) => provider.type === t) &&
              i + 1 < providers.length &&
              <hr />}
              {provider.type === "email" && (
                <form action={provider.signinUrl} method="POST">
                  <input type="hidden" name="csrfToken" value={csrfToken} />
                  <label
                    className="section-header"
                    htmlFor={`input-email-for-${provider.id}-provider`}
                  >
                    Email
                  </label>
                  <input
                    id={`input-email-for-${provider.id}-provider`}
                    autoFocus
                    type="email"
                    name="email"
                    value={email}
                    placeholder="email@example.com"
                    required
                  />
                  <button id="submitButton" type="submit" tabIndex={0}>
                    Sign in with {provider.name}
                  </button>
                </form>
              )}
              {provider.type === "credentials" && (
                <form action={provider.callbackUrl} method="POST">
                  <input type="hidden" name="csrfToken" value={csrfToken} />
                  {Object.keys(provider.credentials).map((credential) => {
                    return (
                      <div key={`input-group-${provider.id}`}>
                        <label
                          className="section-header"
                          htmlFor={`input-${credential}-for-${provider.id}-provider`}
                        >
                          {provider.credentials[credential].label ?? credential}
                        </label>
                        <input
                          name={credential}
                          id={`input-${credential}-for-${provider.id}-provider`}
                          type={provider.credentials[credential].type ?? "text"}
                          placeholder={
                            provider.credentials[credential].placeholder ?? ""
                          }
                          {...provider.credentials[credential]}
                        />
                      </div>
                    )
                  })}
                  <button id="submitButton" type="submit" tabIndex={0}>
                    Sign in with {provider.name}
                  </button>
                </form>
              )}
              {provider.type === "passkey" && (
                <form
                  id="passkey-form"
                  action={provider.callbackUrl}
                  method="POST"
                >
                  <input type="hidden" name="csrfToken" value={csrfToken} />
                  <label
                    className="section-header"
                    htmlFor={`input-email-for-${provider.id}-provider`}
                  >
                    Email
                  </label>
                  <input
                    id={`input-email-for-${provider.id}-provider`}
                    autoFocus
                    type="email"
                    name="email"
                    autoComplete="username webauthn"
                    value={email}
                    placeholder="email@example.com"
                    required
                  />
                  <button type="submit" tabIndex={0}>Sign in with {provider.name}</button>
                </form>
              )}
              {["email", "credentials", "passkey"].some((t) => provider.type === t) &&
              i + 1 < providers.length &&
              <hr />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
