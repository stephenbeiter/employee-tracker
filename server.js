const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// connect to db
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Mypassql123',
  database: 'employeesDB'
});

connection.connect(err => {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId + '\n');
  menuPrompt();
});

// prompt menu
function menuPrompt() {
  let menu = [
    'View All Departments',
    'View All Roles',
    'View All Employees',
    new inquirer.Separator(),
    'Add New Department',
    'Add New Role',
    'Add New Employee',
    new inquirer.Separator(),
    'View Employees By Department',
    'View Employees By Role',
    'View Employees By Manager',
    new inquirer.Separator(),
    "Update Employee's Role",
    "Update Employee's Manager",
    new inquirer.Separator(),
    'Delete Department',
    'Delete Role',
    'Delete Employee',
    new inquirer.Separator(),
    'Exit',
    new inquirer.Separator()
  ];

  inquirer.prompt({
    name: 'menu',
    type: 'list',
    message: 'Please select an option:',
    choices: menu
  })
    .then(answer => {
      switch (answer.menu) {
        case 'View All Departments':
          return allDepartments();
        case 'View All Roles':
          return allRoles();
        case 'View All Employees':
          return allEmployees();
        case 'Add New Department':
          return addDepartment();
        case 'Add New Role':
          return addRole();
        case 'Add New Employee':
          return addEmployee();
        case 'View Employees By Department':
          return empByDept();
        case 'View Employees By Role':
          return empByRole();
        case 'View Employees By Manager':
          return empByManager();
        case "Update Employee's Role":
          return updateRole();
        case "Update Employee's Manager":
          return updateManager();
        case 'Delete Department':
          return delDept();
        case 'Delete Role':
          return delRole();
        case 'Delete Employee':
          return delEmp();
        case "Exit":
          console.log('Goodbye!')
          connection.end()
      }
    })
};

function reMenu(lastFunc) {
  inquirer.prompt(
    {
      name: 'menu',
      type: 'list',
      choices: ['Return to menu', 'Repeat this option'],
      message: 'Would you like to return to the menu or repeat this option?'
    }
  ).then(answer => {
    if (answer.menu === 'Return to menu') {
      menuPrompt()
    } else {
      switch (lastFunc) {
        case 'addDept':
          return addDepartment();
        case 'addRole':
          return addRole();
        case 'addEmp':
          return addEmployee();
        case 'empDept':
          return empByDept();
        case 'empRole':
          return empByRole();
        case 'empMan':
          return empByManager();
        case 'upRole':
          return updateRole();
        case 'upMan':
          return updateManager();
        case 'delDept':
          return delDept();
        case 'delRole':
          return delRole();
        case 'delEmp':
          return delEmp();
        case undefined:
          return menuPrompt();
      }
    }
  })
};

// table arrays
var depts = [];
var roles = [];
var emps = [];
var mgrs = [];

// queries to populate table arrays
function getDepts() {
  return connection.promise().query('SELECT * FROM departments')
    .then(res => {
      depts = [];
      res[0].forEach(dept => {
        depts.push({ name: dept.department, value: dept.id })
      })
    })
};

function getRoles() {
  return connection.promise().query('SELECT * FROM roles')
    .then(res => {
      roles = [];
      res[0].forEach(role => {
        roles.push({ name: role.title, value: role.id })
      })
    })
};

function getEmps() {
  return connection.promise().query('SELECT * FROM employees')
    .then(empQuery => {
      emps = [];
      empQuery[0].forEach(emp => {
        emps.push({ name: emp.first_name + ' ' + emp.last_name, value: emp.id })
      })
    })
};

function getMgrs() {
  return connection.promise().query('SELECT * FROM employees WHERE manager_id IS NULL')
    .then((res) => {
      mgrs = [{ name: 'None', value: null }];
      res[0].forEach(manager => {
        mgrs.push({ name: manager.first_name + ' ' + manager.last_name, value: manager.id })
      })
    })
};

// db query functions
function allDepartments() {
  connection.query('SELECT department AS "Departments" FROM departments', (err, res) => {
    if (err) throw err;
    console.table(res)
    console.log('--------------------')
    reMenu()
  })
};

function allRoles() {
  connection.query('SELECT title AS "Job Title", salary AS "Salary", department AS "Department" FROM roles LEFT JOIN departments ON roles.department_id = departments.id', (err, res) => {
    if (err) throw err;
    console.table(res)
    console.log('--------------------')
    reMenu()
  })
};

function allEmployees() {
  let sql = 'SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Job Title", department AS "Department", salary AS "Annual Salary", IFNULL((SELECT concat(first_name, " ", last_name) FROM employees AS emp WHERE employees.manager_id = emp.id), "") AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id';
  connection.query(sql, (err, res) => {
    if (err) throw err;
    console.table(res)
    console.log('--------------------')
    reMenu()
  })
};

function addDepartment() {
  inquirer.prompt({
    name: 'addDep',
    type: 'input',
    message: 'Enter name of new department:',
    validate: input => {
      if (input) {
        return true
      } else {
        console.log('Please enter the name of the new department!')
        return false
      }
    }
  }).then(function (answer) {
    connection.query('INSERT INTO departments SET ?', {
      department: answer.addDep
    }, (err, res) => {
      if (err) throw err;
      console.log('New department added successfully!')
      console.log('--------------------')
      reMenu('addDept')
    })
  })
};

function addRole() {
  let depts = [];

  connection.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err
    res.forEach(dept => {
      depts.push({ name: dept.department, value: dept.id })
    })
  });

  inquirer.prompt([
    {
      name: 'addRole',
      type: 'input',
      message: 'Enter the name of the new role:',
      validate: input => {
        if (input) {
          return true
        } else {
          console.log('Please enter name of new role!')
          return false
        }
      }
    },
    {
      name: 'addSalary',
      type: 'number',
      message: 'Enter the salary of the new role:',
      validate: input => {
        if (input) {
          return true
        } else {
          console.log('Please enter the salary for the new role!')
          return false
        }
      }
    },
    {
      name: 'addDeptId',
      type: 'list',
      choices: depts,
      message: 'Select the department of the new role:'
    }]).then(answers => {
      connection.query('INSERT INTO roles SET ?', {
        title: answers.addRole,
        salary: answers.addSalary,
        department_id: answers.addDeptId
      }, (err, res) => {
        if (err) throw err;
        console.log('New role added successfully!')
        console.log('--------------------')
        reMenu('addRole')
      })
    })
};

function addEmployee() {
  getRoles()
  getMgrs()
    .then(() => {
      inquirer.prompt([
        {
          name: 'fName',
          type: 'input',
          message: 'Enter the first name of the new employee:',
          validate: input => {
            if (input) {
              return true
            } else {
              console.log('Please enter the first name of the new employee!')
              return false
            }
          }
        },
        {
          name: 'lName',
          type: 'input',
          message: 'Enter the last name of the new employee:',
          validate: input => {
            if (input) {
              return true
            } else {
              console.log('Please enter the last name of the new employee!')
              return false
            }
          }
        },
        {
          name: 'role',
          type: 'list',
          choices: roles,
          message: 'Select the role of the new employee:'
        },
        {
          name: 'manager',
          type: 'list',
          choices: mgrs,
          message: 'Select the manager of the new employee:'
        }
      ]).then(answers => {
        connection.query('INSERT INTO employees SET ?', {
          first_name: answers.fName,
          last_name: answers.lName,
          role_id: answers.role,
          manager_id: answers.manager
        }, (err, res) => {
          if (err) throw err;
          console.log('Employee added successfully!')
          console.log('--------------------')
          reMenu('addEmp')
        })
      })
    })
};

function updateRole() {
  getRoles();
  getEmps()
    .then(() => {
      inquirer.prompt([
        {
          name: 'upEmp',
          type: 'list',
          choices: emps,
          message: 'Select an employee to update their role:'
        },
        {
          name: 'upRole',
          type: 'list',
          choices: roles,
          message: 'Select a new role for the employee:'
        }])
        .then(answers => {
          connection.promise().query(`UPDATE employees SET employees.role_id = ${answers.upRole} WHERE employees.id = ${answers.upEmp}`)
            .then(() => {
              console.log("Employee's role updated successfully!")
              console.log('--------------------')
              reMenu('upRole')
            })
        })
    })
};

function updateManager() {
  getEmps()
  getMgrs()
    .then(() => {
      inquirer.prompt([
        {
          name: 'upEmp',
          type: 'list',
          choices: emps,
          message: 'Select an employee to update their manager:'
        },
        {
          name: 'upManager',
          type: 'list',
          choices: mgrs,
          message: 'Select a new manager for the employee:'
        }])
        .then(answers => {
          connection.query(`UPDATE employees SET employees.manager_id = ${answers.upManager} WHERE employees.id = ${answers.upEmp}`)
          console.log("Employee's manager updated successfully!")
          console.log('--------------------')
          reMenu('upMan')
        })
    })
};

function empByDept() {
  getDepts()
    .then(() => {
      inquirer.prompt({
        name: 'empByDept',
        type: 'list',
        choices: depts,
        message: 'Select which department you would like to view:'
      }).then(answer => {
        let sql = `SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Job Title", department AS "Department", Salary, IFNULL((SELECT concat(first_name, " ", last_name) FROM employees AS emp WHERE employees.manager_id = emp.id), "") AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id WHERE departments.id = ${answer.empByDept}`;
        connection.query(sql, (err, res) => {
          if (err) throw err;
          let deptSal = 0;
          res.forEach(emp => {
            deptSal = deptSal + parseInt(emp.Salary);
          })
          res.push({
            'First Name': '--------------------',
            'Last Name': '--------------------',
            'Job Title': '--------------------',
            Department: '--------------------',
            Salary: '--------------------',
            Manager: '--------------------'
          })
          res.push({
            'Last Name': 'Department',
            'Job Title': 'Budget',
            Department: 'Total:',
            Salary: deptSal
          })
          console.table(res)
          console.log('--------------------')
          reMenu('empDept');
        })
      })
    })
};

function empByRole() {
  getRoles()
    .then(() => {
      inquirer.prompt(
        {
          name: 'empRole',
          type: 'list',
          choices: roles,
          message: 'Select a role to view employee(s)'
        })
        .then(answer => {
          let sql = `SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Job Title", department AS "Department", salary AS "Annual Salary", IFNULL((SELECT concat(first_name, " ", last_name) FROM employees AS emp WHERE employees.manager_id = emp.id), "") AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id WHERE employees.role_id = ${answer.empRole}`;
          connection.promise().query(sql)
            .then(res => {
              console.table(res[0])
              console.log('--------------------')
              reMenu('empRole')
            })
        })
    })
};

function empByManager() {
  getMgrs()
    .then(() => {
      inquirer.prompt({
        name: 'empMan',
        type: 'list',
        choices: mgrs,
        message: 'Select a manager to view their employees:'
      })
        .then(answer => {
          let sql = `SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Job Title", department AS "Department", salary AS "Annual Salary", IFNULL((SELECT concat(first_name, " ", last_name) FROM employees AS emp WHERE employees.manager_id = emp.id), "") AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id WHERE employees.manager_id = ${answer.empMan}`;
          connection.query(sql, (err, res) => {
            if (err) throw err;
            console.table(res)
            console.log('--------------------')
            reMenu('empMan')
          })
        })
    })
};

function delDept() {
  getDepts()
    .then(() => {
      inquirer.prompt([{
        name: 'delDept',
        type: 'list',
        choices: depts,
        message: 'Select the department to delete:'
      },
      {
        name: 'upDept',
        type: 'list',
        choices: depts,
        message: 'Select new department to reassign employees to:'
      }])
        .then(answers => {
          if (answers.delDept === answers.upDept) {
            console.log('Department to delete and to reassign to cannot be the same!')
            return reMenu('delDept')
          }
          connection.query(`DELETE FROM departments WHERE departments.id = ${answers.delDept}`)
          connection.query(`UPDATE roles SET roles.department_id = ${answers.upDept} WHERE roles.department_id = ${answers.delDept}`)
          console.log('Department deleted and employees reassigned successfully!')
          console.log('--------------------')
          reMenu('delDept')
        })
    })
};

function delRole() {
  getRoles()
    .then(() => {
      inquirer.prompt({
        name: 'delRole',
        type: 'list',
        choices: roles,
        message: 'Select the role to delete:'
      })
        .then(answer => {
          connection.query(`DELETE FROM roles WHERE id = ${answer.delRole}`)
          console.log('Role was deleted successfully!')
          console.log('--------------------')
          reMenu('delRole')
        })
    })
};

function delEmp() {
  getEmps()
    .then(() => {
      inquirer.prompt({
        name: 'delEmp',
        type: 'list',
        choices: emps,
        message: 'Select employee to delete:'
      })
        .then(answer => {
          connection.query(`DELETE FROM employees WHERE id = ${answer.delEmp}`)
          console.log('Employee was deleted successfully!')
          console.log('--------------------')
          reMenu('delEmp')
        })
    })
};
