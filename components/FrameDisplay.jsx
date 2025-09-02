import React from 'react';

export default function FrameDisplay({ content }) {
  if (!content || !content.leftContent || !content.rightContent) {
    return <div className="text-earth-500 italic">Invalid frame content</div>;
  }

  const renderContent = (contentData) => {
    if (!contentData || !contentData.data) {
      return <div className="h-full flex items-center justify-center text-earth-500">No content</div>;
    }
    
    switch (contentData.type) {
      case 'text':
        return (
          <div className="h-full p-4 overflow-auto">
            <div 
              className="whitespace-pre-wrap text-earth-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contentData.data }}
            />
          </div>
        );
      
      case 'heading':
        return (
          <div className="h-full p-4 flex items-center">
            <h1 className="text-2xl font-bold text-earth-800">
              {contentData.data}
            </h1>
          </div>
        );
      
      case 'subheading':
        return (
          <div className="h-full p-4 flex items-center">
            <h2 className="text-xl font-semibold text-earth-800">
              {contentData.data}
            </h2>
          </div>
        );
      
      case 'image':
        if (!contentData.data?.url || !contentData.data.url.startsWith('http')) {
          return <div className="h-full flex items-center justify-center text-earth-500">Invalid image URL</div>;
        }
        return (
          <div className="h-full overflow-hidden">
            <img
              src={contentData.data.url}
              alt={contentData.data.alt || "Frame content"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentElement.innerHTML = '<div class="h-full flex items-center justify-center text-earth-500">Image failed to load</div>';
              }}
            />
            {contentData.data.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                {contentData.data.caption}
              </div>
            )}
          </div>
        );
      
      case 'table':
        if (!contentData.data?.rows) {
          return <div className="h-full flex items-center justify-center text-earth-500">No table data</div>;
        }
        return (
          <div className="h-full p-4 overflow-auto">
            <table className="w-full border-collapse border border-earth-300 text-sm">
              <tbody>
                {contentData.data.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-earth-300 px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'code':
        return (
          <div className="h-full p-4 overflow-auto">
            <pre className="bg-earth-100 p-3 rounded text-sm font-mono h-full overflow-auto">
              <code>{contentData.data}</code>
            </pre>
          </div>
        );
      
      case 'quote':
        return (
          <div className="h-full p-4 flex items-center">
            <blockquote className="border-l-4 border-accent pl-4 py-2 bg-earth-50 italic text-earth-700 w-full">
              {contentData.data}
            </blockquote>
          </div>
        );
      
      case 'icon':
        return (
          <div className="h-full p-4 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⭐</div>
              <span className="text-earth-800 text-lg">{contentData.data?.text || 'Icon text'}</span>
            </div>
          </div>
        );
      
      case 'banner':
        const bannerColors = {
          info: 'bg-blue-100 border-blue-400 text-blue-800',
          success: 'bg-green-100 border-green-400 text-green-800',
          warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
          error: 'bg-red-100 border-red-400 text-red-800'
        };
        const colorClass = bannerColors[contentData.data?.type] || bannerColors.info;
        
        return (
          <div className="h-full p-4 flex items-center">
            <div className={`border-l-4 p-3 rounded w-full ${colorClass}`}>
              <p className="font-medium">{contentData.data?.text || 'Banner message'}</p>
            </div>
          </div>
        );
      
      case 'placeholder':
        return (
          <div className="h-full p-4 flex items-center justify-center">
            <div className="border-2 border-dashed border-earth-300 rounded-lg w-full h-full flex items-center justify-center">
              <div className="text-center text-earth-500">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-sm">Ready for content</p>
                <p className="text-xs text-earth-400 mt-1">
                  Drag elements here
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="h-full flex items-center justify-center text-earth-500">Unknown content type: {contentData.type}</div>;
    }
  };

  const { leftContent, rightContent, splitRatio = 50, borderStyle = 'solid', borderWidth = 1, borderColor = '#e5e7eb' } = content;

  return (
    <div 
      className="w-full rounded-lg overflow-hidden bg-white min-h-[300px] shadow-sm relative"
      style={{
        border: borderStyle !== 'none' ? `${borderWidth}px ${borderStyle} ${borderColor}` : '1px solid #e5e7eb'
      }}
    >
      <div className="flex h-full min-h-[300px]">
        <div style={{ width: `${splitRatio}%` }} className="h-full relative">
          {renderContent(leftContent)}
        </div>
        {borderStyle !== 'none' && (
          <div 
            className="border-l h-full"
            style={{
              borderLeftWidth: `${borderWidth}px`,
              borderLeftStyle: borderStyle,
              borderLeftColor: borderColor
            }}
          ></div>
        )}
        <div style={{ width: `${100 - splitRatio}%` }} className="h-full relative">
          {renderContent(rightContent)}
        </div>
      </div>
    </div>
  );
}
