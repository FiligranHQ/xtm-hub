import { createAuthDirectiveTransformer } from './auth-directive.transformer';
import { hasCapability, isAuthenticated } from './validators/auth.validator';
import { hasServiceCapability } from './validators/service-capability.validator';

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
