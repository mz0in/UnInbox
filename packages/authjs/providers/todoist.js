/**
 * Add Todoist login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/todoist
 * ```
 *
 * #### Configuration
 *```js
 * import Auth from "@auth/core"
 * import Todoist from "@auth/core/providers/todoist"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [Todoist({ clientId: TODOIST_CLIENT_ID, clientSecret: TODOIST_CLIENT_SECRET })],
 * })
 * ```
 *
 * ### Resources
 *
 * - [Todoist OAuth documentation](https://developer.todoist.com/guides/#oauth)
 * - [Todoist configuration](https://developer.todoist.com/appconsole.html)
 *
 * ### Notes
 *
 * By default, Auth.js assumes that the Todoist provider is
 * based on the [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) specification.
 *
 * :::tip
 *
 * The Todoist provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/todoist.ts).
 * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/providers/custom-provider#override-default-options).
 *
 * :::
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 *
 * :::
 */
export default function TodoistProvider(options) {
    return {
        id: "todoist",
        name: "Todoist",
        type: "oauth",
        authorization: {
            url: "https://todoist.com/oauth/authorize",
            params: { scope: "data:read" },
        },
        token: "https://todoist.com/oauth/access_token",
        client: {
            token_endpoint_auth_method: "client_secret_post",
        },
        userinfo: {
            async request({ tokens }) {
                // To obtain Todoist user info, we need to call the Sync API
                // See https://developer.todoist.com/sync/v9
                const res = await fetch("https://api.todoist.com/sync/v9/sync", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sync_token: "*",
                        resource_types: '["user"]',
                    }),
                });
                const { user: profile } = await res.json();
                return profile;
            },
        },
        profile(profile) {
            return {
                id: profile.id,
                email: profile.email,
                name: profile.full_name,
                image: profile.avatar_big,
            };
        },
        style: { logo: "/todoist.svg", text: "#000", bg: "#E44332" },
        options,
    };
}
