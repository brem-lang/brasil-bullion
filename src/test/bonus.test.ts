import { describe, expect, it } from "vitest";
import { bonusUrl, isBonusSearch, whatsappLink } from "@/lib/bonus";

describe("bonus", () => {
  it("points to /cadastro?bonus=1, keeps UTMs and drops the hash", () => {
    expect(bonusUrl("https://brasil.example/cadastro?utm_source=meta#form")).toBe(
      "https://brasil.example/cadastro?utm_source=meta&bonus=1",
    );
    expect(bonusUrl("https://brasil.example/descubra?bonus=1")).toBe(
      "https://brasil.example/cadastro?bonus=1",
    );
  });

  it("detects the bonus flag", () => {
    expect(isBonusSearch("?bonus=1")).toBe(true);
    expect(isBonusSearch("?utm_source=x&bonus=1")).toBe(true);
    expect(isBonusSearch("?bonus=0")).toBe(false);
    expect(isBonusSearch("")).toBe(false);
  });
});

describe("whatsappLink", () => {
  it("always gives a wa.me link with the bonus message", () => {
    const url = new URL(whatsappLink());
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toContain("bônus de 100%");
  });
});
