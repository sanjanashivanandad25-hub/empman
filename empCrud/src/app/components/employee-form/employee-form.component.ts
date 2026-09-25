import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, this.nonEmptyStringValidator()]],
      age: [null, [Validators.required, Validators.min(1)]],
      salary: [0, [Validators.required, Validators.min(0)]],
      desig: ['', [Validators.required, this.nonEmptyStringValidator()]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.employeeId = Number(idParam);
        this.loadEmployee(this.employeeId);
      } else {
        this.isEditMode = false;
        this.employeeId = null;
      }
    });
  }

  private nonEmptyStringValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value ?? '';
      if (typeof value !== 'string') {
        return null;
      }
      return value.trim().length > 0 ? null : { nonEmpty: true };
    };
  }

  private loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          name: employee.name,
          age: employee.age,
          salary: employee.salary,
          desig: employee.desig,
        });
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.employeeForm.get(fieldName);
    if (!control || !control.touched || !control.invalid) {
      return '';
    }

    if (control.hasError('required')) {
      if (fieldName === 'name' || fieldName === 'desig') {
        return `${fieldName === 'name' ? 'Name' : 'Designation'} is required.`;
      }
      return `${fieldName === 'age' ? 'Age' : 'Salary'} is required.`;
    }

    if (control.hasError('nonEmpty')) {
      return `${fieldName === 'name' ? 'Name' : 'Designation'} cannot be empty.`;
    }

    if (control.hasError('min')) {
      if (fieldName === 'age') {
        return 'Age must be greater than 0.';
      }
      return 'Salary cannot be negative.';
    }

    return 'Please enter a valid value.';
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const employee: Employee = {
      id: this.employeeId ?? 0,
      name: this.employeeForm.value.name.trim(),
      age: Number(this.employeeForm.value.age),
      salary: Number(this.employeeForm.value.salary),
      desig: this.employeeForm.value.desig.trim(),
    };

    const request$ = this.isEditMode && this.employeeId !== null
      ? this.employeeService.updateEmployee(this.employeeId, employee)
      : this.employeeService.addEmployee(employee);

    request$.subscribe({
      next: () => {
        const successMessage = this.isEditMode ? 'Employee updated successfully.' : 'Employee added successfully.';
        this.router.navigate(['/employees'], { queryParams: { success: successMessage } });
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}
