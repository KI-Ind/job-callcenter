// Resume section component
{currentSection === 'resume' ? (
  <form onSubmit={handleUploadSubmit} className="space-y-4">
    <div>
      <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
        Téléverser votre CV (PDF, DOC, DOCX - 5MB max)
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          id="resume"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {selectedFile && (
          <span className="text-sm text-gray-500">
            {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </span>
        )}
      </div>
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}% téléversé</p>
        </div>
      )}
    </div>
    
    <div className="flex justify-end space-x-3 mt-4">
      <button
        type="button"
        onClick={() => {
          setCurrentSection(null)
          setSelectedFile(null)
          setError('')
        }}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        disabled={isUploading}
      >
        Annuler
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Téléversement...' : 'Téléverser'}
      </button>
    </div>
  </form>
) : (
  <div>
    {profileData.resume ? (
      <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow duration-200">
        <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{profileData.resume?.filename || 'CV.pdf'}</p>
          <p className="text-xs text-gray-500">Téléversé le {profileData.resume?.uploadDate ? new Date(profileData.resume.uploadDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <a 
          href={profileData.resume?.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-auto px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Télécharger
        </a>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-500 mb-2">Aucun CV téléversé</p>
        {isEditing && (
          <button 
            onClick={() => setCurrentSection('resume')}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Ajouter un CV
          </button>
        )}
      </div>
    )}
  </div>
)}
