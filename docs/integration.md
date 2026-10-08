# Host-site integration

## Initial direction

Both `ddrarchive.org` and `innovationdesign.io` embed the same centrally hosted timeline using a responsive iframe. This keeps releases and rollback independent from host-site content deployments. SOW-06 owns live URLs, host changes, and production validation.

## Origin and message policy

- The iframe is read-only and must not receive API credentials or other secrets.
- Do not use wildcard `targetOrigin` for `postMessage`.
- If host-to-frame messaging is needed, define a versioned message envelope, exact origin allowlist, allowed message types, and validation behavior before implementation.
- Ignore messages from unknown origins and reject malformed or unsupported versions.
- No message protocol is enabled in SOW-01.

## Responsive embedding

The host wrapper must provide a fluid width and enough height for the timeline. Validate keyboard navigation, narrow viewport behavior, and focus visibility across both origins during SOW-06. Do not make the timeline's internal view depend on cross-origin parent inspection.