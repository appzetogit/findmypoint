const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Admin
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  let {
    empIdNumber,
    name,
    address,
    fieldLocation,
    bloodGroup,
    contactNumber,
    photo,
    designation,
    joinedDate,
    isValidWorking
  } = req.body;

  if (!name || !contactNumber || !designation || !joinedDate) {
    return res.status(400).json({ success: false, message: 'Please provide name, contact number, designation, and joined date.' });
  }

  try {
    // Generate next empIdNumber if not provided
    if (!empIdNumber) {
      const allEmployees = await Employee.find({});
      let maxNum = 0;
      allEmployees.forEach((emp) => {
        const match = emp.empIdNumber.match(/^FMPEMP(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      });
      const nextNum = maxNum + 1;
      const paddedNum = String(nextNum).padStart(3, '0');
      empIdNumber = `FMPEMP${paddedNum}`;
    } else {
      const employeeExists = await Employee.findOne({ empIdNumber });
      if (employeeExists) {
        return res.status(400).json({ success: false, message: `Employee ID ${empIdNumber} already exists.` });
      }
    }

    const employee = await Employee.create({
      empIdNumber,
      name,
      address: address || '',
      fieldLocation: fieldLocation || '',
      bloodGroup: bloodGroup || 'O+',
      contactNumber,
      photo: photo || '',
      designation,
      joinedDate,
      isValidWorking: isValidWorking !== undefined ? isValidWorking : true
    });

    res.status(201).json({
      success: true,
      employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  const {
    empIdNumber,
    name,
    address,
    fieldLocation,
    bloodGroup,
    contactNumber,
    photo,
    designation,
    joinedDate,
    isValidWorking
  } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (empIdNumber && empIdNumber !== employee.empIdNumber) {
      const exists = await Employee.findOne({ empIdNumber });
      if (exists) {
        return res.status(400).json({ success: false, message: `Employee ID ${empIdNumber} already exists.` });
      }
      employee.empIdNumber = empIdNumber;
    }

    if (name !== undefined) employee.name = name;
    if (address !== undefined) employee.address = address;
    if (fieldLocation !== undefined) employee.fieldLocation = fieldLocation;
    if (bloodGroup !== undefined) employee.bloodGroup = bloodGroup;
    if (contactNumber !== undefined) employee.contactNumber = contactNumber;
    if (photo !== undefined) employee.photo = photo;
    if (designation !== undefined) employee.designation = designation;
    if (joinedDate !== undefined) employee.joinedDate = joinedDate;
    if (isValidWorking !== undefined) employee.isValidWorking = isValidWorking;

    const updatedEmployee = await employee.save();

    res.status(200).json({
      success: true,
      employee: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    await Employee.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee by custom empIdNumber (Public Verification)
// @route   GET /api/employees/verify/:empIdNumber
// @access  Public
const getEmployeeByEmpId = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      empIdNumber: { $regex: new RegExp(`^${req.params.empIdNumber}$`, 'i') }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active employees for public selection
// @route   GET /api/employees/public
// @access  Public
const getActiveEmployeesPublic = async (req, res) => {
  try {
    const employees = await Employee.find({ isValidWorking: true })
      .select('name empIdNumber')
      .sort({ name: 1 });
    res.status(200).json({
      success: true,
      employees
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeByEmpId,
  getActiveEmployeesPublic
};
