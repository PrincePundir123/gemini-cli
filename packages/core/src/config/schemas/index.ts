/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/**
 * Schema for ProjectRegistry configuration
 */
export const ProjectRegistrySchema = z.object({
  projects: z.record(z.string(), z.string()),
});

export type ProjectRegistry = z.infer<typeof ProjectRegistrySchema>;

/**
 * Schema for TrustedHooks configuration
 */
export const TrustedHooksConfigSchema = z.record(
  z.string(), // projectPath
  z.array(z.string()), // Array of trusted hook keys
);

export type TrustedHooksConfig = z.infer<typeof TrustedHooksConfigSchema>;

/**
 * Generic JSON configuration loader with validation
 */
export async function loadAndValidateConfig<T>(
  filePath: string,
  schema: z.ZodSchema<T>,
  fallbackValue: T,
  debugLogger?: { error: (msg: string, details?: unknown) => void },
): Promise<T> {
  try {
    const fs = await import('node:fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return schema.parse(parsed);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (debugLogger) {
      debugLogger.error(`Failed to load and validate config from ${filePath}`, {
        filePath,
        error: errorMessage,
        expectedSchema:
          schema instanceof z.ZodObject
            ? Object.keys((schema as z.ZodObject<any>).shape)
            : 'See schema definition',
        fallbackUsed: fallbackValue,
      });
    }

    return fallbackValue;
  }
}

/**
 * Synchronous version of loadAndValidateConfig for sync contexts
 */
export function loadAndValidateConfigSync<T>(
  filePath: string,
  schema: z.ZodSchema<T>,
  fallbackValue: T,
  debugLogger?: { error: (msg: string, details?: unknown) => void },
): T {
  try {
    const fs = require('node:fs');
    if (!fs.existsSync(filePath)) {
      return fallbackValue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return schema.parse(parsed);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (debugLogger) {
      debugLogger.error(`Failed to load and validate config from ${filePath}`, {
        filePath,
        error: errorMessage,
        expectedSchema:
          schema instanceof z.ZodObject
            ? Object.keys((schema as z.ZodObject<any>).shape)
            : 'See schema definition',
        fallbackUsed: fallbackValue,
      });
    }

    return fallbackValue;
  }
}
