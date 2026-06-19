import React from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface GradeItem {
  title: string;
  rk1: number;
  rk2: number;
  exam: number;
  total_percent: number;
  fa_grades?: any[];
}

interface ExportModalProps {
  data: GradeItem[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ data, onClose }) => {
  
  const userData = data.length > 0 ? {
    course: (data[0] as any).course || "N/A",
    semester: (data[0] as any).semester || "N/A",
  } : { course: "N/A", semester: "N/A"};

  const exportToCSV = () => {
    const cleanData = data.map(item => ({
      title: item.title,
      rk1: item.rk1,
      rk2: item.rk2,
      exam: item.exam,
      total_percent: item.total_percent,
      fa_grades: Array.isArray(item.fa_grades) 
        ? item.fa_grades.map((g, i) => `FA${i + 1}:${g.value}`).join('; ') 
        : "None"
    }));

    const csv = Papa.unparse(cleanData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grades_report.csv";
    link.click();
    onClose();
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Academic Performance Report", 14, 15);
    doc.setFontSize(11);
    doc.text(`Course: ${userData.course}`, 14, 25);
  doc.text(`Semester: ${userData.semester}`, 14, 31);
    doc.setDrawColor(200);
    doc.line(14, 42, 196, 42);

    const addChartToPDF = async (label: string, dataKey: keyof GradeItem, color: string, yPos: number) => {
      const validData = data.filter(d => d[dataKey] !== undefined && d[dataKey] !== null);
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: validData.map(d => d.title),
            datasets: [{ label, data: validData.map(d => d[dataKey] as number), backgroundColor: color }]
          },
          options: { responsive: false, animation: false, scales: { y: { beginAtZero: true, max: 100 } } }
        });
        
        const img = canvas.toDataURL('image/png');
        doc.addImage(img, 'PNG', 14, yPos, 180, 70);
      }
    };

    await addChartToPDF('RK1 Scores', 'rk1', '#3498db', 45);
    await addChartToPDF('RK2 Scores', 'rk2', '#f1c40f', 120);
    doc.addPage();
    await addChartToPDF('Exam Scores', 'exam', '#e74c3c', 20);
    await addChartToPDF('Total Percent', 'total_percent', '#27ae60', 100);

    doc.addPage();
    const tableData = data.map(item => [item.title, item.rk1 ?? '-', item.rk2 ?? '-', item.exam ?? '-', item.total_percent ?? '-']);
    autoTable(doc, { 
        head: [['Subject', 'RK1', 'RK2', 'Exam', 'Total']], 
        body: tableData, 
        startY: 20,
        headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save("detailed_academic_report.pdf");
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Export Data</h3>
        <div className="button-group">
        <button onClick={exportToCSV} className="btn btn-csv">
          Download as CSV
        </button>
        <button onClick={exportToPDF} className="btn btn-pdf">
          Download as PDF (with Analysis)
        </button>
        <button onClick={onClose} className="btn btn-cancel">
          Cancel
        </button>
      </div>
      </div>
    </div>
  );
};