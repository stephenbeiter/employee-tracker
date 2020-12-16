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
  questions = [{
    name: 'menu',
    type: 'list',
    message: 'Please select an option:',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      new inquirer.Separator(),
      'Add New Department',
      'Add New Role',
      'Add New Employee',
      new inquirer.Separator(),
      "Update Employee's Role",
      'View Employees By Role',
      new inquirer.Separator(),
      "Update Employee's Manager",
      'View Employees By Manager',
      new inquirer.Separator(),
      'View Department Staff and Budget',
      new inquirer.Separator(),
      'Delete Department',
      'Delete Role',
      'Delete Employee',
      new inquirer.Separator(),
      'Exit',
      new inquirer.Separator()
    ]
  }];
  inquirer.prompt(questions).then(answer => {
    switch (answer.menu) {
      case 'View All Departments':
        return allDepartments();
      case 'View All Roles':
        return allRoles();
      case 'View All Employees':
        return allEmployees();
      case 'Add New Role':
        return addRole();
      case 'Add New Employee':
        return addEmployee();
      case 'Add New Department':
        return addDepartment();
      case 'View Department Staff and Budget':
        return empByDept();
      case "Update Employee's Role":
        return updateEmp();
      case "Exit":
        console.log('Goodbye!')
        connection.end()
    }
  })
};

function reMenu() {
  inquirer.prompt(
    {
      name: 'menu',
      type: 'confirm',
      message: 'Would you like to return to the menu?',
      default: true
    }
  ).then(answer => {
    if (answer.menu) {
      menuPrompt()
    } else {
      reMenu();
    }
  })
};

// db query functions
const allDepartments = () => {
  connection.query('SELECT department AS "Departments" FROM departments', (err, res) => {
    if (err) throw err;
    console.table(res)
    console.log('--------------------')
    reMenu()
  })
};

const allRoles = () => {
  connection.query('SELECT title, salary AS "Salary" FROM roles', (err, res) => {
    if (err) throw err;
    console.table(res)
    console.log('--------------------')
    reMenu()
  })
};

const allEmployees = () => {
  let sql = 'SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Job Title", department AS "Department", salary AS "Annual Salary", IFNULL((SELECT concat(first_name, " ", last_name) FROM employees AS emp WHERE employees.manager_id = emp.id), "None") AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id';
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
      reMenu()
    })
  })
};

function addRole() {
  let depts = [];

  connection.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err
    res.forEach(dept => {
      depts.push({ name: dept.department, value: dept.id, short: dept.department })
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
        reMenu()
      })
    })
};

function addEmployee() {
  let roles = [];

  connection.query('SELECT * FROM roles', (err, res) => {
    if (err) throw err;
    res.forEach(role => {
      roles.push({ name: role.title, value: role.id, short: role.title })
    })
  });

  let managers = [{ name: 'None', value: null, short: 'None' }];

  connection.query('SELECT * FROM employees WHERE manager_id IS NULL', (err, res) => {
    if (err) throw err;
    res.forEach(manager => {
      managers.push({ name: manager.first_name + ' ' + manager.last_name, value: manager.id, short: manager.first_name })
    })
  });

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
      choices: managers,
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
      reMenu()
    })
  })
};

async function empByDept() {
  let depts = [];

  const mysqlProm = require('mysql2/promise');

  const conProm = await mysqlProm.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mypassql123',
    database: 'employeesDB'
  });

  await conProm.query('SELECT * FROM departments').then(res => {
    res[0].forEach(dept => {
      depts.push({ name: dept.department, value: dept.id, short: dept.department })
    });
  });

  try {
    inquirer.prompt({
      name: 'empByDept',
      type: 'list',
      choices: depts,
      message: 'Select which department you would like to view:'
    }).then(answer => {
      let sql = 'SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Job Title", department AS "Department", salary AS "Annual Salary", IFNULL((SELECT concat(first_name, " ", last_name) FROM employees AS emp WHERE employees.manager_id = emp.id), "None") AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id WHERE departments.id = ?';
      connection.query(sql, [answer.empByDept], (err, res) => {
        if (err) throw err;
        console.table(res)
        console.log('--------------------')
        reMenu();
      })
    })
  } catch (err) {
    console.log(err)
  }
};

function updateEmp() {
  let emps = [];
  let roles = [];
  connection.promise().query('SELECT * FROM employees')
    .then(empQuery => {
      empQuery[0].forEach(emp => {
        emps.push({ name: emp.first_name + ' ' + emp.last_name, value: emp.id, short: emp.first_name + ' ' + emp.last_name })
      })
    })
    .then(() => {
      connection.query('SELECT * FROM roles', (err, res) => {
        if (err) throw err;
        res.forEach(role => {
          roles.push({ name: role.title, value: role.id, short: role.title })
        })
      })
    })
    .then(() => {
      inquirer.prompt([{
        name: 'upEmp',
        type: 'list',
        choices: emps,
        message: 'Select an employee to update their role:'
      },
      {
        name: 'upRole',
        type: 'list',
        choices: roles,
        message: "Select the employee's new role:"
      }]).then(answers => {
        connection.query(`UPDATE employees SET employees.role_id = ${answers.upRole} WHERE employees.id = ${answers.upEmp}`, (err, res) => {
          if (err) throw err;
          console.log("New role update was successful!")
          reMenu();
        })
      })
    })
}
