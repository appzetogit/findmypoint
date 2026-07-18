const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeByEmpId,
  getActiveEmployeesPublic
} = require('../controllers/employeeController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Public verification routes
router.get('/verify/:empIdNumber', getEmployeeByEmpId);
router.get('/public', getActiveEmployeesPublic);

// All other employee routes are admin-protected
router.use(adminProtect);

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
