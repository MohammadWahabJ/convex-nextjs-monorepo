import { z } from "zod";

export const widgetSettingsSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
  welcomeTitle: z.string().optional(),
  welcomeDescription: z.string().optional(),
  aiNotice: z.string().optional(),
  privacyPolicyText: z.string().optional(),
  faqTitle: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  mutedTextColor: z.string().optional(),
  borderColor: z.string().optional(),
  buttonBackgroundColor: z.string().optional(),
  faqs: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().min(1, "Question cannot be empty"),
      })
    )
    .optional(),
  enabledDepartments: z.array(z.string()).optional(),
});
