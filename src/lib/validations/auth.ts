import { z } from "zod";

// ---- Student Registration ----
export const studentStep1Schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  identifier_type: z.enum(["matric", "registration"]),
  matric_number: z.string().optional(),
  registration_number: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
}).superRefine((data, ctx) => {
  if (data.identifier_type === "matric") {
    if (!data.matric_number || !/^\d{9}$/.test(data.matric_number)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["matric_number"], message: "Matric number must be exactly 9 digits" });
    }
  } else {
    if (!data.registration_number || !/^\d{12}[A-Za-z]{2}$/.test(data.registration_number)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registration_number"], message: "Registration number must be 12 digits followed by 2 letters" });
    }
  }
});

export const studentStep2Schema = z.object({
  faculty: z.string().min(1, "Select a faculty"),
  department: z.string().min(1, "Select a department"),
  level: z.string().min(1, "Select a level"),
});

export const studentStep3Schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

// ---- Student Login ----
export const studentLoginSchema = z.object({
  identifier: z.string().min(1, "Enter your Matric or Registration number"),
  password: z.string().min(1, "Enter your password"),
});

// ---- Staff Registration ----
export const staffRegisterSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  staff_id: z.string().min(1, "Staff ID is required"),
  sub_role: z.enum(["BURSAR", "AUDITOR", "HOD"], { message: "Select a sub-role" }),
  faculty: z.string().min(1, "Select a faculty"),
  department: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
}).superRefine((data, ctx) => {
  if (data.sub_role === "HOD" && !data.department) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["department"], message: "HOD must select a department" });
  }
});

// ---- Staff Login ----
export const staffLoginSchema = z.object({
  staff_id: z.string().min(1, "Enter your Staff ID"),
  password: z.string().min(1, "Enter your password"),
});

// ---- Admin Login ----
export const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type StudentStep1 = z.infer<typeof studentStep1Schema>;
export type StudentStep2 = z.infer<typeof studentStep2Schema>;
export type StudentStep3 = z.infer<typeof studentStep3Schema>;
export type StudentLoginForm = z.infer<typeof studentLoginSchema>;
export type StaffRegisterForm = z.infer<typeof staffRegisterSchema>;
export type StaffLoginForm = z.infer<typeof staffLoginSchema>;
export type AdminLoginForm = z.infer<typeof adminLoginSchema>;
