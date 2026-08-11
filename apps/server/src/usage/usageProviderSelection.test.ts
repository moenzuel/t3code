import {
  DEFAULT_SERVER_SETTINGS,
  ProviderDriverKind,
  ProviderInstanceId,
  type ServerSettings,
} from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { selectEnabledUsageProviders } from "./usageProviderSelection.ts";

const settings = (overrides: Partial<ServerSettings>): ServerSettings => ({
  ...DEFAULT_SERVER_SETTINGS,
  ...overrides,
});

describe("selectEnabledUsageProviders", () => {
  it("includes only enabled usage providers", () => {
    const providers = selectEnabledUsageProviders(
      settings({
        providers: {
          ...DEFAULT_SERVER_SETTINGS.providers,
          claudeAgent: { ...DEFAULT_SERVER_SETTINGS.providers.claudeAgent, enabled: false },
          codex: { ...DEFAULT_SERVER_SETTINGS.providers.codex, enabled: true },
        },
      }),
    );

    expect([...providers]).toEqual(["codex"]);
  });

  it("includes a provider when any of its instances is enabled", () => {
    const providers = selectEnabledUsageProviders(
      settings({
        providers: {
          ...DEFAULT_SERVER_SETTINGS.providers,
          claudeAgent: { ...DEFAULT_SERVER_SETTINGS.providers.claudeAgent, enabled: false },
        },
        providerInstances: {
          [ProviderInstanceId.make("claude_work")]: {
            driver: ProviderDriverKind.make("claudeAgent"),
            enabled: true,
          },
        },
      }),
    );

    expect([...providers]).toEqual(["claude", "codex"]);
  });

  it("lets an explicit default instance override legacy enablement", () => {
    const providers = selectEnabledUsageProviders(
      settings({
        providerInstances: {
          [ProviderInstanceId.make("claudeAgent")]: {
            driver: ProviderDriverKind.make("claudeAgent"),
            enabled: false,
          },
        },
      }),
    );

    expect([...providers]).toEqual(["codex"]);
  });

  it("reads legacy enabled state from an explicit instance config", () => {
    const providers = selectEnabledUsageProviders(
      settings({
        providerInstances: {
          [ProviderInstanceId.make("codex")]: {
            driver: ProviderDriverKind.make("codex"),
            config: { enabled: false },
          },
        },
      }),
    );

    expect([...providers]).toEqual(["claude"]);
  });
});
