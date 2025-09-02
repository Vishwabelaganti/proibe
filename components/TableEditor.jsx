import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, X } from 'lucide-react';

export default function TableEditor({ content, onChange, onSave, onCancel }) {
  const [tableData, setTableData] = useState(() => {
    if (content && content.rows) {
      return content;
    }
    return {
      rows: [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
        ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
      ],
      headerRows: [0] // Array of row indices that are headers
    };
  });

  // Sync local tableData state with content prop when content changes
  useEffect(() => {
    if (content && JSON.stringify(content) !== JSON.stringify(tableData)) {
      // Handle migration from old hasHeader format to new headerRows format
      if (content.hasHeader !== undefined && !content.headerRows) {
        const migratedContent = {
          ...content,
          headerRows: content.hasHeader ? [0] : []
        };
        delete migratedContent.hasHeader;
        setTableData(migratedContent);
      } else {
        setTableData(content);
      }
    }
  }, [content]);

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex][colIndex] = value;
    const newData = { ...tableData, rows: newRows, headerRows: tableData.headerRows || [] };
    setTableData(newData);
    onChange(newData);
  };

  const addRow = () => {
    const colCount = tableData.rows[0]?.length || 3;
    const newRow = Array(colCount).fill('');
    const newData = { ...tableData, rows: [...tableData.rows, newRow], headerRows: tableData.headerRows || [] };
    setTableData(newData);
    onChange(newData);
  };

  const removeRow = (index) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== index);
    // Update headerRows indices when a row is removed
    const newHeaderRows = tableData.headerRows
      .filter(headerIndex => headerIndex !== index) // Remove the deleted row from headers
      .map(headerIndex => headerIndex > index ? headerIndex - 1 : headerIndex); // Adjust indices
    const newData = { ...tableData, rows: newRows, headerRows: newHeaderRows };
    setTableData(newData);
    onChange(newData);
  };

  const addColumn = () => {
    const newRows = tableData.rows.map(row => [...row, '']);
    const newData = { ...tableData, rows: newRows, headerRows: tableData.headerRows || [] };
    setTableData(newData);
    onChange(newData);
  };

  const removeColumn = (colIndex) => {
    if (tableData.rows[0]?.length <= 1) return;
    const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
    const newData = { ...tableData, rows: newRows, headerRows: tableData.headerRows || [] };
    setTableData(newData);
    onChange(newData);
  };

  const toggleHeader = () => {
    const newData = { ...tableData, hasHeader: !tableData.hasHeader };
    setTableData(newData);
    onChange(newData);
  };

  const toggleRowAsHeader = (rowIndex) => {
    const headerRows = tableData.headerRows || [];
    const isHeader = headerRows.includes(rowIndex);
    const newHeaderRows = isHeader
      ? headerRows.filter(index => index !== rowIndex)
      : [...headerRows, rowIndex].sort((a, b) => a - b);
    const newData = { ...tableData, headerRows: newHeaderRows };
    setTableData(newData);
    onChange(newData);
  };

  const isHeaderRow = (rowIndex) => {
    return (tableData.headerRows || []).includes(rowIndex);
  };

  return (
    <div className="bg-white rounded-lg border border-earth-200 p-6 shadow-sm">
      {/* Table Controls */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={addRow}
          className="px-3 py-2 bg-earth-50 hover:bg-earth-100 rounded text-sm flex items-center gap-2 font-medium transition-colors border border-earth-200"
        >
          <Plus size={14} />
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="px-3 py-2 bg-earth-50 hover:bg-earth-100 rounded text-sm flex items-center gap-2 font-medium transition-colors border border-earth-200"
        >
          <Plus size={14} />
          Add Column
        </button>
        <div className="text-sm text-earth-600 italic">
          Click "Header" next to any row to toggle it as a header row
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={`group ${isHeaderRow(rowIndex) ? 'bg-earth-100' : ''}`}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-earth-200 p-2 relative group/cell">
                    {isHeaderRow(rowIndex) ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="w-full bg-earth-200/50 font-semibold text-earth-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent/30 rounded px-2 py-1 transition-colors"
                          placeholder="Header"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-transparent text-earth-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent/30 rounded px-2 py-1 transition-colors"
                        placeholder="Enter content..."
                      />
                    )}
                    {/* Column delete button - show only on first row */}
                    {rowIndex === 0 && (
                      <button
                        onClick={() => removeColumn(colIndex)}
                        className="absolute -top-1 -right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 shadow-sm z-10"
                        title="Remove column"
                      >
                        <Minus size={10} />
                      </button>
                    )}
                  </td>
                ))}
                {/* Row controls */}
                <td className="border-none p-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => toggleRowAsHeader(rowIndex)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        isHeaderRow(rowIndex)
                          ? 'bg-accent text-white'
                          : 'bg-earth-100 hover:bg-earth-200 text-earth-700'
                      }`}
                      title={isHeaderRow(rowIndex) ? "Remove header" : "Make header"}
                    >
                      Header
                    </button>
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 shadow-sm transition-colors"
                      title="Remove row"
                    >
                      <Minus size={10} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 flex items-center gap-2 font-medium transition-colors"
        >
          <Save size={16} />
          Save Table
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-earth-100 hover:bg-earth-200 rounded flex items-center gap-2 font-medium border border-earth-200 text-earth-700 transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
}
