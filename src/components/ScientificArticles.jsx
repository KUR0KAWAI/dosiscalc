import React, { useState } from 'react'
import { FileText, X, ExternalLink } from 'lucide-react'

const ARTICLES = [
    {
        id: 1,
        title: 'Errores de medicación en pediatría',
        author: 'Sala et al. (SEFH)',
        year: '',
        justification: 'Analiza errores de dosificación ×10 en pediatría por cálculo manual mg/kg.',
        pdfUrl: 'https://www.sefh.es/bibliotecavirtual/erroresmedicacion/027.pdf',
    },
    {
        id: 2,
        title: 'Errores de medicación en pacientes pediátricos',
        author: 'Quintero et al.',
        year: '2020',
        justification: '59,56% errores por dosis incorrecta; valida calculadoras automáticas.',
        pdfUrl: 'https://dialnet.unirioja.es/descarga/articulo/8154132.pdf',
    },
    {
        id: 3,
        title: 'Errores de dosificación en pediatría',
        author: 'Gutiérrez et al. (Uruguay)',
        year: '2008',
        justification: 'Prevalencia errores prescripción/transcripción en niños hospitalizados.',
        pdfUrl: 'https://www.sup.org.uy/archivos-de-pediatria/adp82-3/pdf/adp82-3-gutierrez-errores.pdf',
    },
    {
        id: 4,
        title: 'Guía práctica cálculo de dosis pediátricas',
        author: 'Guía clínica',
        year: '2023',
        justification: 'Protocolo para dosificación mg/kg con ejemplos jarabes/suspensiones.',
        pdfUrl: 'https://www.guiafarmapediatrica.es/sites/default/files/inline-files/Guia_dosificacion_3_edicion.pdf',
    },
    {
        id: 5,
        title: 'Errores de medicación: revisión bibliográfica',
        author: 'Revista Médica VozAndes',
        year: '2024',
        justification: '',
        pdfUrl: 'https://revistamedicavozandes.com/wp-content/uploads/2024/07/v35i14.pdf',
    },
]

export default function ScientificArticles() {
    const [selectedPdf, setSelectedPdf] = useState(null)

    const openPdfViewer = (article) => {
        setSelectedPdf(article)
    }

    const closePdfViewer = () => {
        setSelectedPdf(null)
    }

    return (
        <>
            <section className="max-w-6xl mx-auto px-4 mt-16 mb-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">Referencias Científicas</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Artículos que respaldan la importancia de herramientas automatizadas para prevenir errores de
                        dosificación en pediatría
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ARTICLES.map((article) => (
                        <article
                            key={article.id}
                            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-teal-300 transition-all duration-300 cursor-pointer group"
                            onClick={() => openPdfViewer(article)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-teal-100 p-3 rounded-lg group-hover:bg-teal-200 transition-colors shrink-0">
                                    <FileText className="text-teal-600 w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-1">
                                        {article.author} {article.year && `(${article.year})`}
                                    </p>
                                    {article.justification && (
                                        <p className="text-xs text-slate-500 mt-3 line-clamp-3">{article.justification}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
                                <span>Ver PDF</span>
                                <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* PDF Viewer Modal */}
            {selectedPdf && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={closePdfViewer}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{selectedPdf.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    {selectedPdf.author} {selectedPdf.year && `(${selectedPdf.year})`}
                                </p>
                            </div>
                            <button
                                onClick={closePdfViewer}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                                aria-label="Cerrar"
                            >
                                <X className="w-6 h-6 text-slate-600" />
                            </button>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-hidden bg-slate-50">
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPdf.pdfUrl)}&embedded=true`}
                                className="w-full h-full border-0"
                                title={selectedPdf.title}
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <a
                                href={selectedPdf.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir en nueva pestaña
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    )
}
