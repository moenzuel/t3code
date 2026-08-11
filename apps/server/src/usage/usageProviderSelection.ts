import {
  defaultInstanceIdForDriver,
  ProviderDriverKind,
  type ServerSettings,
  type UsageProviderKind,
} from "@t3tools/contracts";
import * as Predicate from "effect/Predicate";

const USAGE_PROVIDER_BY_DRIVER = new Map<ProviderDriverKind, UsageProviderKind>([
  [ProviderDriverKind.make("claudeAgent"), "claude"],
  [ProviderDriverKind.make("codex"), "codex"],
]);

const configEnabled = (config: unknown): boolean | undefined => {
  if (!Predicate.isObject(config)) return undefined;
  const enabled = config["enabled"];
  return Predicate.isBoolean(enabled) ? enabled : undefined;
};

const isDriverEnabled = (settings: ServerSettings, driver: ProviderDriverKind): boolean => {
  for (const instance of Object.values(settings.providerInstances)) {
    if (instance.driver !== driver) continue;
    if ((instance.enabled ?? configEnabled(instance.config) ?? true) === true) return true;
  }

  const defaultInstanceId = defaultInstanceIdForDriver(driver);
  if (defaultInstanceId in settings.providerInstances) return false;

  const legacySettings = settings.providers[driver as keyof ServerSettings["providers"]];
  return legacySettings?.enabled === true;
};

export function selectEnabledUsageProviders(
  settings: ServerSettings,
): ReadonlySet<UsageProviderKind> {
  const providers = new Set<UsageProviderKind>();
  for (const [driver, provider] of USAGE_PROVIDER_BY_DRIVER) {
    if (isDriverEnabled(settings, driver)) providers.add(provider);
  }
  return providers;
}
