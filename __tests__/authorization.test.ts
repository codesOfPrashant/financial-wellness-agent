import { describe, it, expect } from "vitest";
import {
  assertOwnership,
  forbiddenResponse,
  requireOwnership,
  unauthorizedResponse,
} from "@/lib/authorization";
import { PRIYA, RAHUL } from "./fixtures/payroll-scenarios";

describe("authorization — employee data isolation", () => {
  describe("Priya Sharma (emp_101)", () => {
    it("allows access to her own payroll and payslip records", () => {
      expect(assertOwnership(PRIYA, "emp_101")).toBe(true);
      expect(requireOwnership(PRIYA, "emp_101")).toBeNull();
    });

    it("blocks access to Rahul's payslip (cross-user leakage scenario)", () => {
      expect(assertOwnership(PRIYA, "emp_102")).toBe(false);
      const res = requireOwnership(PRIYA, "emp_102");
      expect(res?.status).toBe(403);
    });
  });

  describe("Rahul Mehta (emp_102)", () => {
    it("allows access to his own records only", () => {
      expect(assertOwnership(RAHUL, "emp_102")).toBe(true);
      expect(requireOwnership(RAHUL, "emp_102")).toBeNull();
    });

    it("blocks Priya from Rahul's data when roles reversed", () => {
      expect(assertOwnership(RAHUL, "emp_101")).toBe(false);
    });
  });

  describe("API error responses", () => {
    it("returns 401 for unauthenticated requests", () => {
      const res = unauthorizedResponse();
      expect(res.status).toBe(401);
    });

    it("returns 403 with clear message for forbidden payslip access", async () => {
      const res = forbiddenResponse(
        "You do not have permission to access this resource."
      );
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe("FORBIDDEN");
    });
  });
});
