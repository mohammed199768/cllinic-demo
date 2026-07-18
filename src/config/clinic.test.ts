import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import {
  CLINIC,
  SITE_METADATA_IDENTITY,
  mailtoHref,
  telHref,
  whatsappHref,
} from "./clinic";

describe("public clinic identity", () => {
  it("provides the exact bilingual demo identity and contact links", () => {
    expect(CLINIC.name).toEqual({ ar: "عيادتنا", en: "OurClinic" });
    expect(CLINIC.phone).toBe("0779667168");
    expect(CLINIC.phoneE164).toBe("+962779667168");
    expect(telHref).toBe("tel:+962779667168");
    expect(CLINIC.email).toBe("mohammed.aldomi68@gmail.com");
    expect(mailtoHref).toBe("mailto:mohammed.aldomi68@gmail.com");
    expect(CLINIC.address).toEqual({ ar: "عمّان، الأردن", en: "Amman, Jordan" });
    expect(CLINIC.maps).toContain("query=Amman%2C%20Jordan");
    expect(CLINIC.timezone).toBe("Asia/Amman");
    expect(whatsappHref()).toBe("https://wa.me/962779667168");
  });

  it("uses the identity in metadata and the PWA manifest", () => {
    expect(SITE_METADATA_IDENTITY).toMatchObject({
      applicationName: "OurClinic",
      title: "عيادتنا | OurClinic",
    });
    expect(SITE_METADATA_IDENTITY.description).toContain("Amman, Jordan");
    const pwa = manifest();
    expect(pwa.name).toBe("OurClinic | عيادتنا");
    expect(pwa.short_name).toBe("OurClinic");
    expect(pwa.description).toContain("OurClinic");
  });

  it("keeps public form sources generic", () => {
    const root = path.resolve(__dirname, "..");
    const contact = fs.readFileSync(path.join(root, "components/views/ContactView.tsx"), "utf8");
    const footer = fs.readFileSync(path.join(root, "components/SiteFooter.tsx"), "utf8");
    const child = fs.readFileSync(path.join(root, "components/KidsRewardFlow.tsx"), "utf8");
    expect(contact).toContain('source: "CONTACT_PAGE"');
    expect(footer).toContain('source: "SITE_FOOTER"');
    expect(child).toContain('type: "CHILD_FORM"');
    expect(`${contact}\n${footer}\n${child}`).toContain('@ourclinic/local-data');
    expect(`${contact}\n${footer}\n${child}`).not.toMatch(/0796119707|796119707/i);
  });
});
