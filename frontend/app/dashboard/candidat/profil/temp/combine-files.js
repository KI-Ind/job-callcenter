const fs = require('fs');
const path = require('path');

// Read the component files
const interfaces = fs.readFileSync(path.join(__dirname, 'interfaces.ts'), 'utf8');
const pageStructure = fs.readFileSync(path.join(__dirname, 'page-structure.tsx'), 'utf8');
const componentFunctions = fs.readFileSync(path.join(__dirname, 'component-functions.tsx'), 'utf8');
const resumeSection = fs.readFileSync(path.join(__dirname, 'resume-section.tsx'), 'utf8');

// Create the combined file
let combinedFile = "'use client'\n\n";
combinedFile += "import React, { useState, useEffect } from 'react'\n";
combinedFile += "import { useAuth } from '../../../../contexts/AuthContext'\n";
combinedFile += "import api from '../../../../services/api'\n";
combinedFile += "import axios from 'axios';\n\n";

// Add interfaces
combinedFile += interfaces.replace("export ", "") + "\n\n";

// Create the component
combinedFile += "export default function ProfilePage() {\n";

// Add state variables from page-structure
const stateVars = pageStructure.split('export default function ProfilePage() {')[1]
  .split('// Component functions will be added here')[0];
combinedFile += stateVars;

// Add component functions
combinedFile += componentFunctions + "\n\n";

// Add render function start
combinedFile += "  return (\n";
combinedFile += "    <div className=\"space-y-8 max-w-5xl mx-auto px-4 py-8\">\n";
combinedFile += "      <div className=\"flex items-center justify-between\">\n";
combinedFile += "        <h1 className=\"text-2xl font-bold text-gray-900\">Mon Profil</h1>\n";
combinedFile += "        <button \n";
combinedFile += "          onClick={() => {\n";
combinedFile += "            // Toggle editing mode\n";
combinedFile += "            const newEditingState = !isEditing\n";
combinedFile += "            setIsEditing(newEditingState)\n";
combinedFile += "            \n";
combinedFile += "            // If we're exiting edit mode, clear the current section\n";
combinedFile += "            if (!newEditingState) {\n";
combinedFile += "              setCurrentSection(null)\n";
combinedFile += "            }\n";
combinedFile += "          }}\n";
combinedFile += "          className=\"px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow\"\n";
combinedFile += "        >\n";
combinedFile += "          {isEditing ? 'Annuler' : 'Modifier le profil'}\n";
combinedFile += "        </button>\n";
combinedFile += "      </div>\n\n";

// Add error and success messages
combinedFile += "      {error && (\n";
combinedFile += "        <div className=\"bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6 animate-fadeIn\" role=\"alert\">\n";
combinedFile += "          <div className=\"flex items-center\">\n";
combinedFile += "            <svg className=\"h-5 w-5 text-red-500 mr-2\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n";
combinedFile += "              <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z\" clipRule=\"evenodd\" />\n";
combinedFile += "            </svg>\n";
combinedFile += "            <p className=\"font-medium\">{error}</p>\n";
combinedFile += "          </div>\n";
combinedFile += "        </div>\n";
combinedFile += "      )}\n\n";

combinedFile += "      {success && (\n";
combinedFile += "        <div className=\"bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6 animate-fadeIn\" role=\"alert\">\n";
combinedFile += "          <div className=\"flex items-center\">\n";
combinedFile += "            <svg className=\"h-5 w-5 text-green-500 mr-2\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n";
combinedFile += "              <path fillRule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z\" clipRule=\"evenodd\" />\n";
combinedFile += "            </svg>\n";
combinedFile += "            <p className=\"font-medium\">Votre profil a été mis à jour avec succès.</p>\n";
combinedFile += "          </div>\n";
combinedFile += "        </div>\n";
combinedFile += "      )}\n";
      
// Add resume section
combinedFile += "      \n      {/* Resume Section */}\n";
combinedFile += "      <div className=\"bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg\">\n";
combinedFile += "        <div className=\"px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50\">\n";
combinedFile += "          <div className=\"flex justify-between items-center\">\n";
combinedFile += "            <h2 className=\"text-lg font-medium text-gray-900\">CV / Resume</h2>\n";
combinedFile += "            {isEditing && !currentSection && (\n";
combinedFile += "              <button\n";
combinedFile += "                onClick={() => setCurrentSection('resume')}\n";
combinedFile += "                className=\"px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-200\"\n";
combinedFile += "              >\n";
combinedFile += "                {profileData.resume ? 'Modifier' : 'Ajouter'}\n";
combinedFile += "              </button>\n";
combinedFile += "            )}\n";
combinedFile += "          </div>\n";
combinedFile += "        </div>\n";
combinedFile += "        <div className=\"p-6\">\n";
combinedFile += "          " + resumeSection + "\n";
combinedFile += "        </div>\n";
combinedFile += "      </div>\n";

// Close the component
combinedFile += "    </div>\n";
combinedFile += "  )\n";
combinedFile += "}\n";

// Write the combined file
fs.writeFileSync(path.join(__dirname, '..', 'page.tsx'), combinedFile);
console.log('Combined file created successfully at: ' + path.join(__dirname, '..', 'page.tsx'));
