package com.example.SpringBootdemo1;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/employees")
public class Mycontroller {

    private final EmployeeService employeeService;

    @Autowired
    public Mycontroller(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getEmployeeCount() {
        return ResponseEntity.ok(employeeService.getEmployeeCount());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<Employee>> getEmployeesByName(@PathVariable String name) {
        List<Employee> employees = employeeService.getEmployeesByName(name);
        if (employees.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable int id) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(employee);
    }

    @PostMapping
    public ResponseEntity<?> addEmployee(@RequestBody Employee employee) {
        try {
            String validationMessage = employeeService.validateEmployee(employee);
            if (validationMessage != null) {
                return ResponseEntity.badRequest().body(validationMessage);
            }

            Employee savedEmployee = employeeService.saveEmployee(employee);
            if (savedEmployee == null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Employee with this id already exists or the request is invalid.");
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEmployee);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Duplicate employee id or database constraint issue.");
        } catch (ObjectOptimisticLockingFailureException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Employee record was modified by another request. Please refresh and try again.");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to create employee.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable int id, @RequestBody Employee employeeDetails) {
        try {
            String validationMessage = employeeService.validateEmployee(employeeDetails);
            if (validationMessage != null) {
                return ResponseEntity.badRequest().body(validationMessage);
            }

            Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
            if (updatedEmployee == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedEmployee);
        } catch (ObjectOptimisticLockingFailureException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Employee record was modified by another request. Please refresh and try again.");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to update employee.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployeeById(@PathVariable int id) {
        if (!employeeService.deleteEmployee(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAllEmployees() {
        employeeService.deleteAllEmployees();
        return ResponseEntity.ok("All employees deleted successfully");
    }
}