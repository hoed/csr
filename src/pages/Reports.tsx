import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useIndicators } from '../hooks/useIndicators';

const Reports = () => {
  const { projects } = useProjects();
  const { indicators } = useIndicators();
  const [selectedProject, setSelectedProject] = useState('all');
  const [reportType, setReportType] = useState('impact');
  const [dateRange, setDateRange] = useState('month');

  const generateReport = () => {
    // Report generation logic would go here
    console.log('Generating report:', { selectedProject, reportType, dateRange });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate and download impact reports for your projects
        </p>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              className="form-select w-full"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              className="form-select w-full"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="impact">Impact Summary</option>
              <option value="indicators">Indicators Detail</option>
              <option value="financial">Financial Report</option>
              <option value="activities">Activities Log</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              className="form-select w-full"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="btn-primary w-full"
            >
              <FileText size={16} className="mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {[
            {
              name: 'Q3 2023 Impact Summary',
              type: 'Impact Report',
              project: 'Clean Water Initiative',
              date: '2023-10-01',
              size: '2.4 MB'
            },
            {
              name: 'August Activities Report',
              type: 'Activities Log',
              project: 'Youth Education Program',
              date: '2023-09-01',
              size: '1.8 MB'
            },
            {
              name: 'H1 2023 Financial Report',
              type: 'Financial Report',
              project: 'All Projects',
              date: '2023-07-15',
              size: '3.2 MB'
            }
          ].map((report, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {report.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Filter size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">{report.type}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-4">{report.size}</span>
                  <button className="text-gray-400 hover:text-gray-500">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;