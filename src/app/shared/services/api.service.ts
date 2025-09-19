import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly httpClient = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:3000' as const;
  private readonly requestTimeout = 10_000 as const;
  private readonly retryAttempts = 3 as const;

  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly isLoading = this.loadingState.asReadonly();
  readonly lastError = this.errorState.asReadonly();

  get<T>(endpoint: string): Observable<T> {
    return this.createRequest(() =>
      this.httpClient.get<T>(`${this.baseUrl}${endpoint}`),
    );
  }

  // Note: POST, PUT, DELETE methods removed as they are not used in this application
  // Add them back if needed for future features

  clearError(): void {
    this.errorState.set(null);
  }

  private createRequest<T>(requestFn: () => Observable<T>): Observable<T> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return requestFn().pipe(
      timeout(this.requestTimeout),
      retry(this.retryAttempts),
      catchError((error: HttpErrorResponse) => this.handleHttpError(error)),
    );
  }

  private handleHttpError(httpError: HttpErrorResponse): Observable<never> {
    this.loadingState.set(false);

    const errorMessage = this.createErrorMessage(httpError);
    this.errorState.set(errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  private createErrorMessage(httpError: HttpErrorResponse): string {
    if (httpError.error instanceof ErrorEvent) {
      return `Network error: ${httpError.error.message}`;
    }

    switch (httpError.status) {
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      case 404:
        return 'The requested data could not be found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Server error: ${httpError.status} - ${httpError.message}`;
    }
  }
}
