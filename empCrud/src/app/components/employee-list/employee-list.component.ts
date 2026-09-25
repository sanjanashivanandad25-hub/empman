import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  deleteModalOpen = false;
  pendingDeleteEmployee: Employee | null = null;

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.successMessage = params.get('success') ?? '';
    });
    this.loadEmployees();
  }

  get safeEmployees(): Employee[] {
    return Array.isArray(this.employees) ? this.employees : [];
  }

  get filteredEmployees(): Employee[] {
    const term = this.searchTerm.trim().toLowerCase();
    const list = this.safeEmployees;

    if (!term) {
      return list;
    }

    return list.filter((employee) => {
      const name = (employee?.name ?? '').toLowerCase();
      const designation = (employee?.desig ?? '').toLowerCase();
      const id = String(employee?.id ?? '');

      return name.includes(term) || designation.includes(term) || id.includes(term);
    });
  }

  get summaryCards() {
    const employees = this.safeEmployees;
    const total = employees.length;
    const average = total
      ? Math.round(employees.reduce((sum, employee) => sum + Number(employee?.salary ?? 0), 0) / total)
      : 0;
    const roles = new Set(employees.map((employee) => String(employee?.desig ?? '').trim().toLowerCase()).filter(Boolean)).size;

    return [
      { label: 'Total Employees', value: String(total), accent: 'violet' },
      { label: 'Avg Salary', value: `$${average.toLocaleString()}`, accent: 'cyan' },
      { label: 'Roles', value: String(roles), accent: 'amber' },
    ];
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService
      .getAllEmployees()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (employees) => {
          this.employees = Array.isArray(employees) ? employees : [];
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.employees = [];
          this.errorMessage = error?.message ?? 'Unable to load employees.';
          this.cdr.detectChanges();
        },
      });
  }

  openDeleteModal(employee: Employee): void {
    this.pendingDeleteEmployee = employee;
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.pendingDeleteEmployee = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteEmployee) {
      return;
    }

    this.employeeService.deleteEmployee(this.pendingDeleteEmployee.id).subscribe({
      next: () => {
        this.successMessage = 'Employee deleted successfully.';
        this.closeDeleteModal();
        this.loadEmployees();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.closeDeleteModal();
      },
    });
  }
}
