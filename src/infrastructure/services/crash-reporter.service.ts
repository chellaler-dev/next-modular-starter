import * as Sentry from '@sentry/nextjs';


export class CrashReporterService {
  report(error: any): string {
    return Sentry.captureException(error);
  }
}
