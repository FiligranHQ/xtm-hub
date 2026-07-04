# XTM Hub Usage Telemetry

The hub has two complementary telemetry pipelines:

1. **Events** (existing) — user/business events (`login`, `register`, `unregister`, `create_deployment`, `download`, ...) indexed into the hub's Elasticsearch (`telemetry` alias) via the pg-boss queue, replicated to the Filigran data warehouse. Events answer _"what happened"_ (funnels, activity).
2. **Gauges** (this document) — periodic snapshots of aggregate counts exported over OTLP/HTTP to the dedicated Filigran collector, exactly like OpenCTI / OpenAEV / XTM One / OpenGRC. Gauges answer _"what is the current state"_, which the event stream fundamentally cannot (e.g. a platform that unregisters and re-registers inflates event counts forever, while the registered-platforms gauge always reports the truth from the database).

## Transport

- OTLP/HTTP to `https://telemetry.hub.filigran.io/v1/metrics` (production) or `https://telemetry.hub.staging.filigran.io/v1/metrics` (non-production environments).
- Database counts are refreshed hourly; export happens every 6 hours (tighter cadence outside production).
- At startup the collector is probed once (POST `{}`, expect 200); when unreachable, gauge telemetry silently self-disables for the lifetime of the process.
- Implemented in `telemetry-snapshot.app.ts` / `telemetry-snapshot.domain.ts` / `telemetry-snapshot.helper.ts`; started from `index.ts`, stopped via a shutdown hook.

## Resource attributes

| Attribute                   | Description                                                                                                                                              |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service.name`              | Always `xtm-hub-telemetry`.                                                                                                                              |
| `service.version`           | `APP_VERSION` env var, falling back to the package version.                                                                                              |
| `service.instance.id`       | Durable instance UUID seeded by the `add_platform_metadata` migration (`PlatformMetadata` table).                                                        |
| `service.instance.creation` | First-migration timestamp of the instance.                                                                                                               |
| `filigran.telemetry.tags`   | Optional deployment tags from the `TELEMETRY_TAGS` env var (comma-separated, normalized: trimmed, lowercased, deduplicated, sorted). Omitted when unset. |

## Gauges

All gauges are aggregate counts. Dimensions (OTLP attributes) are low-cardinality only — never per-organization or per-user breakdowns.

| Gauge                                      | Dimensions                                                                                    | Description                                                                                                 |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `xtm_hub_total_users_count`                | —                                                                                             | Total number of users.                                                                                      |
| `xtm_hub_active_users_count`               | —                                                                                             | Users with a login in the last 30 days.                                                                     |
| `xtm_hub_disabled_users_count`             | —                                                                                             | Disabled users.                                                                                             |
| `xtm_hub_pending_users_count`              | —                                                                                             | Pending organization memberships.                                                                           |
| `xtm_hub_organizations_count`              | —                                                                                             | Total number of organizations.                                                                              |
| `xtm_hub_organizations_by_type`            | `org_type` (personal / professional)                                                          | Organizations by type.                                                                                      |
| `xtm_hub_registered_platforms_by_identity` | `product` (open-cti / open-aev), `contract` (CE / EE / trial), `status` (active / inactive)   | Registered platforms — the current-state registration gauge.                                                |
| `xtm_hub_trials_by_status`                 | `status` (active / pending / provisioning / queued / cancelled / expired / failed), `product` | Trial deployment requests. Ongoing = non-terminal statuses; rows persist, so the sum is the all-time total. |
| `xtm_hub_active_subscriptions_by_service`  | `service` (service definition identifier)                                                     | Active (started, not ended) subscriptions.                                                                  |
| `xtm_hub_service_instances_count`          | —                                                                                             | Total number of service instances.                                                                          |
| `xtm_hub_shared_resources_by_type`         | `type` (document type)                                                                        | Active, non-decommissioned library documents.                                                               |

## Configuration

| Env var          | Default | Description                                                                                                                               |
| :--------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `TELEMETRY_TAGS` | (empty) | Comma-separated deployment tags (e.g. `saas,eu-west`) attached to every gauge export as the `filigran.telemetry.tags` resource attribute. |
