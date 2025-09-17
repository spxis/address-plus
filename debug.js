const address = '1005 N Gravenstein Highway, Suite 500, Sebastopol, CA';
const commaParts = address.split(',').map(p => p.trim());
console.log('commaParts:');
commaParts.forEach((part, i) => console.log('  ', i, ':', part));

const excludedPartIndices = new Set();
excludedPartIndices.add(1); // Should exclude 'Suite 500'

console.log('\nSliced parts (from index 1):');
const sliced = commaParts.slice(1);
sliced.forEach((part, i) => console.log('  ', i, ':', part, '(original index:', i + 1, ')'));

console.log('\nFiltering logic:');
const nonExcludedParts = sliced.filter((part, index) => {
  const originalIndex = index + 1;
  const shouldExclude = excludedPartIndices.has(originalIndex);
  console.log(
    `  Part '${part}' at index ${index} (original ${originalIndex}): exclude=${shouldExclude}`
  );
  return !shouldExclude;
});

console.log('\nnonExcludedParts:', nonExcludedParts);
console.log('cityStateText:', nonExcludedParts.join(' ').trim());
