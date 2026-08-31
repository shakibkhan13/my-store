/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEnv } from "../env";
import { clsx, type ClassValue } from "clsx";
import { sha256 } from "js-sha256";
import { twMerge } from "tailwind-merge";
import { IValidationConfig } from "../types/component";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateFields = (
  data: Record<string, any>,
  config: IValidationConfig
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const field in config) {
    const value =
      typeof data[field] === "string" ? data[field]?.trim() : data[field];
    const rules = config[field];

    if (rules.required && !value) {
      errors[field] = `${field
        .replace(/([A-Z])/g, " $1")
        .replace("Id", "")} is required`;
      continue;
    }

    if (rules.matchField && value !== data[rules.matchField]) {
      errors[field] = `${field.replace(/([A-Z])/g, " $1")} does not match`;
      continue;
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field.replace(/([A-Z])/g, " $1")} must be at least ${
        rules.minLength
      } characters`;
      continue;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field.replace(/([A-Z])/g, " $1")} must be at most ${
        rules.maxLength
      } characters`;
      continue;
    }

    if (rules.customValidation) {
      const error = rules.customValidation(value);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
};

export const escapeRegExp = (str: string) => {
  if (!str) return "";
  const trimmed = str?.trim()?.replace(/^\*+|\*+$/g, "");
  const escaped = trimmed?.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&");
  return escaped?.replace(/\*/g, ".") || "";
};

export const trimObjectField = <T extends Record<string, any>>(obj: T): T => {
  const trimmedObj = { ...obj };
  for (const key in trimmedObj) {
    if (typeof trimmedObj[key] === "string") {
      trimmedObj[key] = trimmedObj[key].trim();
    }
  }
  return trimmedObj;
};

export const createImageProxyUrl = (imageUrl: string) => {
  const env = getEnv();
  return `${env.NEXT_PUBLIC_API_BASE_URL}/proxy?url=${encodeURIComponent(
    imageUrl
  )}`;
};

export const buildQueryParams = (params: any) => {
  let queryParams = "";
  if (params) {
    let totalParam = 0;
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        let value = params[key];

        if (typeof value === "object") {
          value = JSON.stringify(value);
        } else if (Array.isArray(value)) {
          value = value.join(",");
        }

        if (value !== undefined && value !== null && value !== "") {
          if (totalParam === 0) {
            queryParams += `?${key}=${encodeURIComponent(value)}`;
          } else {
            queryParams += `&${key}=${encodeURIComponent(value)}`;
          }

          totalParam += 1;
        }
      }
    });
  }
  return queryParams;
};

export const hashedPassword = (password: string) => {
  return sha256(password);
};
