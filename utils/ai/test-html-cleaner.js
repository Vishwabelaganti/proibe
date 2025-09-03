// Test script to verify HTML cleaning functionality
const testHtml = `
<p style="font-size: 16px; color: rgb(0, 0, 0);">fewfwef<br></p>
<h1>Design algorithms</h1>
<h2>What is an algorithm</h2>
<p style="font-size: 16px; color: rgb(0, 0, 0);">Set of Instructions in a program.<br>Step by step procedure to solve a computational problem</p>
<h2>Characteristics of Algorithms</h2>
<ul style="border-image: initial; --tw-scale-x: 1; margin-top: 1.25em;">
  <li><span style="font-weight: bolder;">Input</span>&nbsp;: An algorithm needs an input</li>
  <li><span style="font-weight: bolder;">Output</span>&nbsp;: should produce an output</li>
  <li><span style="font-weight: bolder;">Definiteness</span>&nbsp;: Must be finite and Unambiguous</li>
</ul>
`;

function stripHtmlAndClean(html) {
  if (!html || typeof html !== 'string') return '';
  
  // Server-side fallback - improved HTML stripping
  return html
    .replace(/<h([1-6])[^>]*>/gi, (match, level) => '\n' + '#'.repeat(parseInt(level)) + ' ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

console.log('Original HTML:');
console.log(testHtml);
console.log('\nCleaned Text:');
console.log(stripHtmlAndClean(testHtml));
