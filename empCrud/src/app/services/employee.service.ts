import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = 'http://localhost:9999/employees';

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getEmployeeCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`).pipe(catchError(this.handleError));
  }

  getEmployeesByName(name: string): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(`${this.apiUrl}/name/${encodeURIComponent(name)}`)
      .pipe(catchError(this.handleError));
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee).pipe(catchError(this.handleError));
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee).pipe(catchError(this.handleError));
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Unable to connect to the server. Please make sure the Spring Boot application is running.';

    if (error.status === 0) {
      message = 'Unable to connect to the server. Please make sure the Spring Boot application is running.';
    } else if (error.status === 400) {
      message = typeof error.error === 'string' ? error.error : 'Invalid employee data.';
    } else if (error.status === 404) {
      message = 'Employee not found.';
    } else if (error.status === 409) {
      message = 'This employee record could not be saved because of a conflict. Please try again.';
    } else if (error.status === 500) {
      message = 'The server encountered an unexpected error while processing the request.';
    }

    return throwError(() => new Error(message));
  }
}
