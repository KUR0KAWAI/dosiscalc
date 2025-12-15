export function generarReportePDF({
  activeViaId,
  peso,
  intervalo,
  dosisInput,
  medicamentoActual,
  presentacionActual,
  reglaActual,
  resultado,
}) {
  if (!window.jspdf || !resultado) return

  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  // Tema
  const isParenteral = Number(activeViaId) !== 1
  const primaryColor = isParenteral ? [220, 38, 38] : [13, 148, 136]
  const secondaryColor = [55, 65, 81]
  const lightBg = isParenteral ? [254, 242, 242] : [240, 253, 250]

  const fecha = new Date().toLocaleDateString()
  const hora = new Date().toLocaleTimeString()

  const getPageH = () => doc.internal.pageSize.getHeight()
  const getPageW = () => doc.internal.pageSize.getWidth()

  let y = 45 // Inicia más abajo (encabezado compacto)

  const safe = (s) => {
    if (s === null || s === undefined || s === '') return '—'
    return String(s)
  }

  // ================================
  // ENCABEZADO COMPACTO
  // ================================
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('REPORTE CLINICO DE DOSIS', 105, 15, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`${fecha} - ${hora}`, 105, 24, { align: 'center' })

  // ================================
  // SECCIÓN 1: DATOS (2 columnas, ultra compacto)
  // ================================
  doc.setTextColor(0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('1. DATOS DEL PACIENTE Y MEDICAMENTO', 15, y)
  y += 5

  doc.setLineWidth(0.3)
  doc.setDrawColor(200)
  doc.line(15, y, 195, y)
  y += 4

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  // Columna izquierda
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...secondaryColor)
  doc.text('Paciente:', 15, y)
  doc.text('Medicamento:', 15, y + 5)
  doc.text('Prescripcion:', 15, y + 10)
  doc.text('Presentacion:', 15, y + 15)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0)
  doc.text(`${safe(peso)} kg`, 45, y)
  doc.text(safe(medicamentoActual?.nombre_generico), 45, y + 5)
  doc.text(`${safe(dosisInput)} ${safe(reglaActual?.esquema)}`, 45, y + 10)
  doc.text(`${safe(presentacionActual?.conc_cant)}mg/${safe(presentacionActual?.vol_cant)}mL`, 45, y + 15)

  // Columna derecha
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...secondaryColor)
  let viaTexto = 'Oral'
  if (Number(activeViaId) === 2) viaTexto = 'Intravenosa (IV)'
  if (Number(activeViaId) === 3) viaTexto = 'Intramuscular (IM)'

  doc.text('Via:', 115, y)
  doc.text('Tipo:', 115, y + 5)
  doc.text('Intervalo:', 115, y + 10)
  doc.text('Forma:', 115, y + 15)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0)
  doc.text(viaTexto, 135, y)
  const cleanType = safe(medicamentoActual?.tipo_nombre).replace('é', 'e').replace('í', 'i')
  doc.text(cleanType, 135, y + 5)
  doc.text(`Cada ${safe(intervalo)} h`, 135, y + 10)
  doc.text(safe(presentacionActual?.forma), 135, y + 15)

  y += 21

  // ================================
  // SECCIÓN 2: MEMORIA DE CÁLCULO (MINI)
  // ================================
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('2. MEMORIA DE CALCULO', 15, y)
  y += 4

  doc.setLineWidth(0.3)
  doc.setDrawColor(200)
  doc.line(15, y, 195, y)
  y += 3

  doc.setFillColor(248, 250, 252)
  doc.setLineWidth(0.3)
  doc.setDrawColor(226, 232, 240)

  const blockHeight = resultado?.goteoInfo ? 28 : 20
  doc.rect(15, y, 180, blockHeight, 'FD')
  doc.rect(15, y, 180, blockHeight, 'S')

  let formulaY = y + 3
  const printStep = (num, label, math) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...secondaryColor)
    doc.text(`${num}. ${safe(label)}`, 18, formulaY)
    formulaY += 3

    doc.setFont('courier', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(0)
    doc.text(safe(math), 20, formulaY)
    formulaY += 4
  }

  const p1 = resultado?.pasosCalculo?.paso1
  const p2 = resultado?.pasosCalculo?.paso2
  const p3 = resultado?.pasosCalculo?.paso3
  const p4 = resultado?.pasosCalculo?.paso4

  if (p1) printStep(1, p1.label, p1.math)
  if (p2?.label) printStep(2, p2.label, p2.math)

  const stepNum = p2?.label ? 3 : 2
  if (p3) printStep(stepNum, p3.label, p3.math)
  if (resultado?.goteoInfo && p4) printStep(stepNum + 1, p4.label, p4.math)

  y += blockHeight + 5

  // ================================
  // SECCIÓN 3: RESULTADO FINAL
  // ================================
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('3. RESULTADO FINAL', 15, y)
  y += 4

  doc.setLineWidth(0.3)
  doc.line(15, y, 195, y)
  y += 4

  // Tarjeta compacta
  doc.setLineWidth(1.5)
  doc.setFillColor(...lightBg)
  doc.setDrawColor(...primaryColor)
  doc.rect(45, y, 120, 25, 'FD')

  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text(`${safe(resultado?.mlPorDosis)}`, 105, y + 12, { align: 'center' })

  doc.setTextColor(100)
  doc.setFontSize(10)
  doc.text('mL', 125, y + 12)

  doc.setTextColor(60)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const dilText = resultado?.goteoInfo
    ? `+ ${safe(resultado.goteoInfo.diluyente)} mL diluyente`
    : `Administrar cada ${safe(intervalo)} h`
  doc.text(dilText, 105, y + 21, { align: 'center' })

  y += 28

  // ================================
  // SECCIÓN 4: TABLA (Infusión o Resumen)
  // ================================
  doc.setFontSize(8)
  doc.setFillColor(240, 240, 240)
  doc.setDrawColor(150)
  doc.setLineWidth(0.3)

  const tableTitle = resultado?.goteoInfo ? 'VELOCIDAD DE INFUSION' : 'RESUMEN DIARIO'
  const tableWidth = 160
  const tableX = 25

  doc.rect(tableX, y, tableWidth, 6, 'FD')
  doc.setTextColor(50)
  doc.setFont('helvetica', 'bold')
  doc.text(tableTitle, tableX + tableWidth / 2, y + 3.5, { align: 'center' })

  y += 6

  if (resultado?.goteoInfo) {
    // TABLA GOTEO (IV)
    const colW = tableWidth / 2

    // Izq: Normogotero
    doc.rect(tableX, y, colW, 10, 'S')
    doc.setFontSize(7)
    doc.setTextColor(50)
    doc.setFont('helvetica', 'bold')
    doc.text('Normogotero (20)', tableX + colW / 2, y + 2, { align: 'center' })
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.text(safe(resultado.goteoInfo.gotasMin), tableX + colW / 2, y + 7, { align: 'center' })

    // Der: Microgotero
    doc.setFontSize(7)
    doc.setTextColor(50)
    doc.setFont('helvetica', 'bold')
    doc.rect(tableX + colW, y, colW, 10, 'S')
    doc.text('Microgotero/Bomba', tableX + colW + colW / 2, y + 2, { align: 'center' })
    doc.setFontSize(11)
    doc.setTextColor(13, 148, 136)
    doc.text(safe(resultado.goteoInfo.microGotasMin), tableX + colW + colW / 2, y + 7, { align: 'center' })

    // Unidades
    doc.setFontSize(6)
    doc.setTextColor(100)
    doc.setFont('helvetica', 'normal')
    doc.text('gotas/min', tableX + colW / 2, y + 12, { align: 'center' })
    doc.text('mL/h', tableX + colW + colW / 2, y + 12, { align: 'center' })

    y += 14
  } else {
    // TABLA RESUMEN (ORAL/IM)
    const colW = tableWidth / 2

    // Fila 1
    doc.rect(tableX, y, colW, 8, 'S')
    doc.rect(tableX + colW, y, colW, 8, 'S')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50)
    doc.text('Tomas/día', tableX + colW / 2, y + 3.5, { align: 'center' })
    doc.text('Total mL/día', tableX + colW + colW / 2, y + 3.5, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.text(safe(resultado?.tomasDia), tableX + colW / 2, y + 6.5, { align: 'center' })
    doc.text(safe(resultado?.mlTotalDia), tableX + colW + colW / 2, y + 6.5, { align: 'center' })

    y += 9

    // Fila 2
    doc.rect(tableX, y, colW, 8, 'S')
    doc.rect(tableX + colW, y, colW, 8, 'S')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50)
    doc.text('Dosis/toma', tableX + colW / 2, y + 3.5, { align: 'center' })
    doc.text('Total mg/día', tableX + colW + colW / 2, y + 3.5, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(50)
    doc.text(safe(resultado?.mgPorDosis), tableX + colW / 2, y + 6.5, { align: 'center' })
    doc.text(safe(resultado?.mgTotalDia), tableX + colW + colW / 2, y + 6.5, { align: 'center' })

    y += 8

    // Unidades
    doc.setFontSize(6)
    doc.setTextColor(100)
    doc.setFont('helvetica', 'normal')
    doc.text('mL', tableX + colW + colW / 2, y - 1, { align: 'center' })

    y += 3
  }

  y += 2

  // ================================
  // FOOTER
  // ================================
  const pageHeight = getPageH()
  doc.setFillColor(255, 240, 240)
  doc.setDrawColor(255, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(10, pageHeight - 30, getPageW() - 20, 25, 'FD')

  doc.setTextColor(200, 0, 0)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('! ADVERTENCIA DE SEGURIDAD', getPageW() / 2, pageHeight - 22, { align: 'center' })

  doc.setTextColor(50)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const disclaimer = 'Esta herramienta es exclusivamente educativa. La prescripcion, validacion y administracion es responsabilidad unica del personal de salud calificado.'
  const splitText = doc.splitTextToSize(disclaimer, getPageW() - 30)
  doc.text(splitText, getPageW() / 2, pageHeight - 17, { align: 'center' })

  // ================================
  // GUARDAR
  // ================================
  doc.save(`Reporte_${safe(medicamentoActual?.nombre_generico)}.pdf`)
}
