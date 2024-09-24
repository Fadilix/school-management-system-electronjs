import React, { useEffect, useState } from 'react';

const ViewEmployee = ({ employee, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Close on 'Esc' key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300 ease-out"
      role="dialog" 
      aria-labelledby="employee-details-title" 
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl transform transition-all duration-300 ease-out scale-95 sm:scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 id="employee-details-title" className="text-2xl font-bold text-gray-800">Employee Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-800" 
            aria-label="Close employee details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h3>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">First Name</p>
            <p className="mt-1 text-sm text-gray-900">{employee.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Name</p>
            <p className="mt-1 text-sm text-gray-900">{employee.surname}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(employee.date_of_birth)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Gender</p>
            <p className="mt-1 text-sm text-gray-900">{employee.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nationality</p>
            <p className="mt-1 text-sm text-gray-900">{employee.nationality || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Religion</p>
            <p className="mt-1 text-sm text-gray-900">{employee.religion || 'N/A'}</p>
          </div>

          {/* Employment Information */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Employment Information</h3>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Employee Role</p>
            <p className="mt-1 text-sm text-gray-900">{employee.employee_role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date of Joining</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(employee.date_of_joining)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Salary</p>
            <p className="mt-1 text-sm text-gray-900">{employee.monthly_salary ? `FCFA ${employee.monthly_salary}` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Experience</p>
            <p className="mt-1 text-sm text-gray-900">{employee.experience || 'N/A'}</p>
          </div>

          {/* Contact Information */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h3>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mobile Number</p>
            <p className="mt-1 text-sm text-gray-900">{employee.mobile_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-900">{employee.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="mt-1 text-sm text-gray-900">{employee.address || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
