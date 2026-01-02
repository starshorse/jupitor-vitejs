import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const SpreadSheet = ({ title, subTitle, headers, data, headerColor = '#4c51bf', columnWidths }) => {
  const config = useSelector((state) => state.config);
  const spreadHostRef = useRef(null);
  const spreadRef = useRef(null);

  useEffect(() => {
    // SpreadJS 초기화 로직
    const initSpread = () => {
      if (window.GC && window.GC.Spread && spreadHostRef.current) {
        if (spreadRef.current) {
            spreadRef.current.destroy();
        }

        const spread = new window.GC.Spread.Sheets.Workbook(spreadHostRef.current, {
          sheetCount: 1,
          newTabVisible: false
        });
        
        const sheet = spread.getActiveSheet();
        sheet.setRowCount(config.itemsPerPage || 50);
        sheet.setColumnCount(headers.length);
        
        // 헤더 및 컬럼 스타일 설정
        headers.forEach((header, i) => {
          sheet.setValue(0, i, header);
          const headerStyle = new window.GC.Spread.Sheets.Style();
          headerStyle.backColor = headerColor;
          headerStyle.foreColor = '#ffffff';
          headerStyle.font = 'bold 12px Arial';
          headerStyle.hAlign = window.GC.Spread.Sheets.HorizontalAlign.center;
          sheet.setStyle(0, i, headerStyle);
          
          if (columnWidths && columnWidths[i]) {
            sheet.setColumnWidth(i, columnWidths[i]);
          } else {
            sheet.setColumnWidth(i, 150); // 기본 너비
          }
        });
        
        // 데이터 바인딩
        if (data && data.length > 0) {
          data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              sheet.setValue(rowIndex + 1, colIndex, cell);
            });
          });
        }
        
        spreadRef.current = spread;
      }
    };

    // 로컬 파일 경로
    const scriptSrc = '/lib/spreadjs/15.2.2/scripts/gc.spread.sheets.all.15.2.2.min.js';
    const cssHref = '/lib/spreadjs/15.2.2/css/gc.spread.sheets.excel2016colorful.15.2.2.css';

    if (window.GC && window.GC.Spread) {
      initSpread();
    } else if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = cssHref;
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onload = initSpread;
      document.body.appendChild(script);
    }

    // ResizeObserver: 컨테이너 크기 변경 감지
    let resizeObserver;
    if (spreadHostRef.current) {
        resizeObserver = new ResizeObserver(() => {
            if (spreadRef.current) {
                spreadRef.current.refresh();
            }
        });
        resizeObserver.observe(spreadHostRef.current);
    }

    // Cleanup
    return () => {
        if (resizeObserver) resizeObserver.disconnect();
        if (spreadRef.current) {
            spreadRef.current.destroy();
            spreadRef.current = null;
        }
    };
  }, [config.itemsPerPage, headers, data, headerColor, columnWidths]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600">{subTitle}</p>
        <p className="text-sm text-gray-500 mt-2">
          표시 행 수: {config.itemsPerPage} | 자동저장: {config.autoSave ? '활성' : '비활성'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div 
          ref={spreadHostRef}
          style={{ 
            width: '100%', 
            height: '800px',
            border: '1px solid #e5e7eb'
          }}
        />
      </div>
    </div>
  );
};

export default SpreadSheet;

