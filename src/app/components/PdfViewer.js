"use client"

import { useState, useEffect } from 'react';
import { File, Download, ExternalLink, Loader, X } from 'lucide-react';

export default function PdfViewer({ pdfUrl, fileName, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  const handleDownload = () => {
    window.open(pdfUrl.replace('/viewPdf', '/descargar'), '_blank');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <File className="w-5 h-5 mr-2 text-blue-900" />
            <h2 className="text-xl font-semibold">{fileName || 'Factura PDF'}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="bg-blue-900 text-white px-3 py-2 rounded-md flex items-center cursor-pointer hover:bg-blue-800 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 px-3 py-2 rounded-md text-gray-800 hover:bg-gray-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-hidden p-1 bg-gray-100">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader className="w-8 h-8 text-blue-900 animate-spin mb-2" />
                <p className="text-gray-600">Cargando documento...</p>
              </div>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title="Visor de PDF"
            />
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Visualizando factura en formato PDF</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-900 flex items-center text-sm hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Abrir en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  );
}
