package com.example.SpringBootdemo1;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public List<Employee> getEmployeesByName(String name) {
        return employeeRepository.findByNameContainingIgnoreCase(name);
    }

    public long getEmployeeCount() {
        return employeeRepository.count();
    }

    public Employee getEmployeeById(int id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public String validateEmployee(Employee employee) {
        if (employee == null) {
            return "Employee data is required";
        }
        if (employee.getName() == null || employee.getName().trim().isEmpty()) {
            return "Name is required";
        }
        if (employee.getAge() <= 0) {
            return "Age must be greater than 0";
        }
        if (employee.getSalary() < 0) {
            return "Salary cannot be negative";
        }
        if (employee.getDesig() == null || employee.getDesig().trim().isEmpty()) {
            return "Designation is required";
        }
        return null;
    }

    public Employee saveEmployee(Employee employee) {
        if (employee == null) {
            return null;
        }

        employee.setId(0);

        if (validateEmployee(employee) != null) {
            return null;
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(int id, Employee employeeDetails) {
        if (employeeDetails == null) {
            return null;
        }

        employeeDetails.setId(id);

        if (validateEmployee(employeeDetails) != null) {
            return null;
        }

        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return null;
        }

        Employee employee = optionalEmployee.get();
        employee.setName(employeeDetails.getName());
        employee.setAge(employeeDetails.getAge());
        employee.setSalary(employeeDetails.getSalary());
        employee.setDesig(employeeDetails.getDesig());

        return employeeRepository.save(employee);
    }

    public boolean deleteEmployee(int id) {
        if (!employeeRepository.existsById(id)) {
            return false;
        }
        employeeRepository.deleteById(id);
        return true;
    }

    public void deleteAllEmployees() {
        employeeRepository.deleteAll();
    }
}
