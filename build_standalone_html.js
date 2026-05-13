const fs = require('fs');

// Read the data
const data = JSON.parse(fs.readFileSync('pivot_data.json', 'utf8'));

// Read the HTML template
const html = fs.readFileSync('otb_pivot_view.html', 'utf8');

// Replace the fetch call with inline data
const inlineHtml = html.replace(
  /fetch\('pivot_data\.json'\)\s*\.then\(r => r\.json\(\)\)\s*\.then/,
  `Promise.resolve(${JSON.stringify(data)}).then`
);

fs.writeFileSync('otb_pivot_view_standalone.html', inlineHtml);
console.log('Generated otb_pivot_view_standalone.html');
console.log('File size:', (fs.statSync('otb_pivot_view_standalone.html').size / 1024).toFixed(0), 'KB');
