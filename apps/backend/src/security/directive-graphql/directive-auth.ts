import { createAuthDirectiveTransformer } from './auth-directive.transformer';
import { hasCapability, isAuthenticated } from './validator/auth.validator';
import { hasServiceCapability } from './validator/service-capability.validator';

// Export validators for testing or external use
export const authDirectives = {
  isAuthenticated,
  hasCapability,
  hasServiceCapability,
};

// Create and export the transformer
export const authDirectiveTransformer = createAuthDirectiveTransformer(
  isAuthenticated,
  hasCapability,
  hasServiceCapability
);
