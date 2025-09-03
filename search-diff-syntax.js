const fs = require('fs');
const path = require('path');

function searchForDiffSyntax(dir = '.') {
  const results = [];
  
  function searchDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and .git directories
          if (item !== 'node_modules' && item !== '.git') {
            searchDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          // Check if file has target extensions
          const ext = path.extname(item);
          if (['.sql', '.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              if (content.includes('@@')) {
                results.push({
                  file: fullPath,
                  lines: content.split('\n').map((line, index) => 
                    line.includes('@@') ? `${index + 1}: ${line}` : null
                  ).filter(Boolean)
                });
              }
            } catch (err) {
              console.log(`Could not read file: ${fullPath}`);
            }
          }
        }
      }
    } catch (err) {
      console.log(`Could not access directory: ${currentDir}`);
    }
  }
  
  searchDirectory(dir);
  
  if (results.length === 0) {
    console.log('✅ No @@ syntax found in any files!');
  } else {
    console.log('🔍 Found @@ syntax in these files:');
    results.forEach(result => {
      console.log(`\n📁 ${result.file}:`);
      result.lines.forEach(line => console.log(`  ${line}`));
    });
  }
  
  return results;
}

searchForDiffSyntax();