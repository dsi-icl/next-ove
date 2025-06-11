const fs = require('fs');
const path = require('path');

let script = fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', '@sandworm', 'audit', 'src', 'registry', 'npm.js')).toString();
script = script.replace(/const responseRaw = await fetch\(packageUrl\.href, \{\n *headers: \{\n *\.\.\.\(registryInfo\?\.token && \{Authorization: `Bearer \$\{registryInfo\.token}`}\),\n *},\n *}\);/,
`const responseRaw = await fetch(packageUrl.href, {
      headers: {
        ...(registryInfo?.token && { Authorization: \`Bearer \${registryInfo.token}\` }),
      },
      signal: AbortSignal.timeout(${process.argv[2] ?? 30_000})
    });
`);

fs.writeFileSync(path.join(__dirname, '..', '..', 'node_modules', '@sandworm', 'audit', 'src', 'registry', 'npm.js'), script);