// service-locator.ts
// ------------------
// This file acts as a centralized access point for all singleton services
// and repositories in the application. It ensures that every part of the
// code (controllers, use-cases, etc.) gets the same instance of each service
// or repository, enforcing singleton behavior and preventing accidental 
// multiple instantiations.

// ------------------
// Services
// ------------------

// AuthenticationService handles user authentication, session management, 
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
export function getAuthenticationService() {
  return AuthenticationService.getInstance();
}

// CrashReporterService handles reporting errors to Sentry.
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
export function getCrashReporterService() {
  return CrashReporterService.getInstance();
}

// InstrumentationService handles performance monitoring and tracing via Sentry.
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
export function getInstrumentationService() {
  return InstrumentationService.getInstance();
}

// TransactionManagerService wraps database transactions and manages nested transactions.
import { TransactionManagerService } from '@/src/infrastructure/services/transaction-manager.service';
export function getTransactionManagerService() {
  return TransactionManagerService.getInstance();
}

// ------------------
// Repositories
// ------------------

// UsersRepository provides data access for user entities.
import { UsersRepository } from '@/src/modules/auth/users.repository';
export function getUsersRepository() {
  return UsersRepository.getInstance();
}

// TodosRepository provides data access for todo entities.
import { TodosRepository } from '@/src/modules/todos/todos.repository';
export function getTodosRepository() {
  return TodosRepository.getInstance();
}

// ------------------
// Usage Flow
// ------------------
// 1. Controllers or use-cases import this service-locator to access the singletons.
//    e.g., const authService = getAuthenticationService();
// 2. Each `getX()` function returns the same instance every time.
// 3. This approach prevents accidental `new Service()` calls anywhere in the app.
// 4. The service-locator acts purely as a convenience layer; the singleton
//    enforcement is implemented inside each service/repository class.
