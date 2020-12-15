INSERT INTO departments (department)
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal');

INSERT INTO roles (title, salary, department_id)
VALUES ('Sales Manager', 200000, 1),
('Sales Agent', 100000, 1),
('Engineering Manager', 250000, 2),
('Engineer', 120000, 2),
('CFO', 400000, 3),
('CPA', 180000, 3),
('Legal Team Lead', 250000, 4),
('Lawyer', 180000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('Amber', 'Thompson', 1, null),
('Tom', 'Dash', 2, 1),
('Sally', 'McDermot', 3, null),
('Jamie', 'Alexander', 4, 3),
('Michael', 'Scott', 5, null),
('Susan', 'Mann', 6, 5),
('Rasheem', 'Mostert', 7, null),
('Carol', 'Washington', 8, 7);