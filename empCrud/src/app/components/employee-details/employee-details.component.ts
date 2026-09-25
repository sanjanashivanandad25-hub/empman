import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css',
})
export class EmployeeDetailsComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  errorMessage = '';
  deleteModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (!idParam) {
        this.loading = false;
        this.errorMessage = 'Employee ID is missing.';
        return;
      }

      const employeeId = Number(idParam);
      this.employeeService.getEmployeeById(employeeId).subscribe({
        next: (employee) => {
          this.employee = employee;
          this.loading = false;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.loading = false;
        },
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/employees', 'edit', this.employee.id]);
    }
  }

  openDeleteModal(): void {
    if (this.employee) {
      this.deleteModalOpen = true;
    }
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
  }

  deleteEmployee(): void {
    if (!this.employee) {
      return;
    }

    this.employeeService.deleteEmployee(this.employee.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.router.navigate(['/employees'], {
          queryParams: { success: 'Employee deleted successfully.' },
        });
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.closeDeleteModal();
      },
    });
  }
}
