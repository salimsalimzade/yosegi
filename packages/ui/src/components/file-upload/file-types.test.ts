import { describe, expect, it } from "vitest";
import { accepts, describeTypes, extensionOf, fileSize } from "./file-types";

const file = (name: string, type = "") => new File([""], name, { type });

describe("extensionOf", () => {
  it("is the extension in capitals", () => {
    expect(extensionOf("report.final.pdf")).toBe("PDF");
  });

  it("keeps at most four letters", () => {
    expect(extensionOf("notes.markdown")).toBe("MARK");
  });

  it("is FILE without an extension, or for a dot file", () => {
    expect(extensionOf("README")).toBe("FILE");
    expect(extensionOf(".env")).toBe("FILE");
  });
});

describe("accepts", () => {
  it("takes everything without an accept list", () => {
    expect(accepts(file("a.exe"), undefined)).toBe(true);
    expect(accepts(file("a.exe"), "")).toBe(true);
  });

  it("matches extensions, ignoring case", () => {
    expect(accepts(file("Scan.PDF"), ".pdf")).toBe(true);
    expect(accepts(file("scan.png"), ".pdf")).toBe(false);
  });

  it("matches exact types and wildcards", () => {
    expect(accepts(file("a.png", "image/png"), "image/*")).toBe(true);
    expect(accepts(file("a.png", "image/png"), "image/jpeg")).toBe(false);
    expect(accepts(file("a.csv", "text/csv"), ".pdf, text/csv")).toBe(true);
  });
});

describe("describeTypes", () => {
  it("says the list in words", () => {
    expect(describeTypes(".pdf,image/*", "en-US")).toBe("PDF or images");
    expect(describeTypes(".pdf, .docx, text/csv", "en-US")).toBe("PDF, DOCX, or CSV");
  });

  it("joins in the locale's words", () => {
    expect(describeTypes(".pdf,.png", "de-DE")).toBe("PDF oder PNG");
  });

  it("is nothing without an accept list", () => {
    expect(describeTypes(undefined, "en-US")).toBeUndefined();
  });
});

describe("fileSize", () => {
  const english = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

  it("counts in powers of 1024", () => {
    expect(fileSize(512, english)).toBe("512 B");
    expect(fileSize(1024, english)).toBe("1 KB");
    expect(fileSize(1.5 * 1024 * 1024, english)).toBe("1.5 MB");
    expect(fileSize(3 * 1024 ** 3, english)).toBe("3 GB");
  });

  it("stops at GB", () => {
    expect(fileSize(2048 * 1024 ** 3, english)).toBe("2,048 GB");
  });

  it("writes the number in the locale", () => {
    expect(fileSize(1.5 * 1024 * 1024, new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }))).toBe("1,5 MB");
  });
});
