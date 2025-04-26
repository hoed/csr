import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FolderKanban, BarChart3, FileText, ClipboardList, Settings } from 'lucide-react';

const Manual = () => {
  const sections = [
    {
      title: 'Projects',
      icon: <FolderKanban className="w-6 h-6 text-primary-600" />,
      description: 'Create and manage impact projects',
      content: [
        'Create new projects with detailed information',
        'Track project status, budget, and timeline',
        'Monitor project activities and milestones',
        'View project details including location and SDG goals',
        'Generate project-specific reports'
      ]
    },
    {
      title: 'Indicators',
      icon: <BarChart3 className="w-6 h-6 text-primary-600" />,
      description: 'Track impact metrics and KPIs',
      content: [
        'Set up quantitative and qualitative indicators',
        'Define targets and measurement frequencies',
        'Record and track indicator measurements',
        'Monitor progress towards goals',
        'Link indicators to specific SDGs'
      ]
    },
    {
      title: 'Reports',
      icon: <FileText className="w-6 h-6 text-primary-600" />,
      description: 'Generate impact reports and analytics',
      content: [
        'Create customized impact reports',
        'Export data in multiple formats',
        'Generate periodic project summaries',
        'Track financial metrics and budgets',
        'Share reports with stakeholders'
      ]
    },
    {
      title: 'Forms',
      icon: <ClipboardList className="w-6 h-6 text-primary-600" />,
      description: 'Create and manage data collection forms',
      content: [
        'Design custom data collection forms',
        'Set up surveys and assessments',
        'Collect beneficiary feedback',
        'Track form submissions',
        'Analyze collected data'
      ]
    },
    {
      title: 'Settings',
      icon: <Settings className="w-6 h-6 text-primary-600" />,
      description: 'Configure system preferences',
      content: [
        'Manage user profile and organization details',
        'Configure notification preferences',
        'Set up email notifications',
        'Customize dashboard views',
        'Manage user permissions'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">User Manual</h1>
        </div>

        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-gray-600">
            Welcome to ImpactMonitor! This manual will help you understand how to use the platform effectively
            to track and manage your social impact projects.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              
              <p className="text-gray-600 mb-4">{section.description}</p>
              
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/${section.title.toLowerCase()}`}
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  Go to {section.title}
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">Need Help?</h2>
          <p className="text-primary-700 mb-4">
            If you need additional assistance or have questions about using ImpactMonitor, our support team is here to help.
          </p>
          <a
            href="mailto:support@impactmonitor.com"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact Support
            <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Manual;