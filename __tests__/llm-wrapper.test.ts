import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractTextFromLlmResponse,
  getLlmWrapperConfig,
  queryLlmWrapper,
} from "@/services/llm-wrapper.service";

describe("llm-wrapper", () => {
  describe("extractTextFromLlmResponse", () => {
    it("extracts plain response field from wrapper", () => {
      expect(
        extractTextFromLlmResponse({
          response: "Your HRA for April is INR 20,000.",
        })
      ).toBe("Your HRA for April is INR 20,000.");
    });

    it("extracts nested data.text", () => {
      expect(extractTextFromLlmResponse({ data: { text: "Hi" } })).toBe("Hi");
    });

    it("extracts OpenAI-style choices (compat)", () => {
      expect(
        extractTextFromLlmResponse({
          choices: [{ message: { content: "Answer" } }],
        })
      ).toBe("Answer");
    });

    it("stringifies unknown shapes as last resort", () => {
      const out = extractTextFromLlmResponse({ foo: "bar" });
      expect(out).toContain("foo");
    });
  });

  describe("getLlmWrapperConfig", () => {
    beforeEach(() => {
      vi.stubEnv("LLM_WRAPPER_API_TOKEN", "");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("returns null when API token is not set", () => {
      expect(getLlmWrapperConfig()).toBeNull();
    });

    it("returns config when token is present", () => {
      vi.stubEnv("LLM_WRAPPER_API_TOKEN", "test-token");
      vi.stubEnv(
        "LLM_WRAPPER_URL",
        "https://llm-wrapper.example.com"
      );
      const cfg = getLlmWrapperConfig();
      expect(cfg?.token).toBe("test-token");
      expect(cfg?.baseUrl).toBe("https://llm-wrapper.example.com");
    });
  });

  describe("queryLlmWrapper", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it("throws when token missing", async () => {
      vi.stubEnv("LLM_WRAPPER_API_TOKEN", "");
      await expect(
        queryLlmWrapper({ prompt: "Hello" })
      ).rejects.toThrow(/not configured/i);
    });

    it("maps 401 from wrapper to readable error", async () => {
      vi.stubEnv("LLM_WRAPPER_API_TOKEN", "bad-token");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({
            message: "Invalid or expired API token",
            statusCode: 401,
          }),
        })
      );

      await expect(queryLlmWrapper({ prompt: "Hello" })).rejects.toThrow(
        /Invalid or expired API token/i
      );
    });

    it("sends payroll trace metadata on chat requests", async () => {
      vi.stubEnv("LLM_WRAPPER_API_TOKEN", "valid-token");
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ response: "OK" }),
      });
      vi.stubGlobal("fetch", fetchMock);

      await queryLlmWrapper({
        prompt: "How much HRA?",
        metadata: { employeeId: "emp_101", traceId: "test-trace" },
      });

      const body = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string
      );
      expect(body.metadata.employeeId).toBe("emp_101");
      expect(body.metadata.client).toBe("financial-wellness-agent");
    });
  });
});
