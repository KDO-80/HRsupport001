export async function exportToPDF(elementId: string, filename: string) {
  try {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById(elementId)

    if (!element) {
      alert('내보낼 요소를 찾을 수 없습니다')
      return
    }

    const opt = {
      margin: 10,
      filename: `${filename}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'png' as const, quality: 0.98 },
      html2canvas: { scale: 2, logging: false },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm', format: 'a4' }
    }

    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('PDF 내보내기 실패:', error)
    alert('PDF 다운로드에 실패했습니다')
  }
}
