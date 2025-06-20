import { formatDateToYYYYMMDD } from "@/utils/index";

describe("date", () => {
  it("formatDateToYYYYMMDD", () => {
    const date = new Date("2025-06-20 12:00:00");
    const formattedDate = formatDateToYYYYMMDD(date);
    expect(formattedDate).toBe("20250620");
  });
});