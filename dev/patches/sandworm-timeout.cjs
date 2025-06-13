const fs = require('fs');
const path = require('path');
const { execSync } = require("child_process");

const res = execSync(`find ${path.join(__dirname, "..", "..", "node_modules", ".pnpm")} -maxdepth 1 -type d -name '@sandworm+audit@*' -print`).toString();
const filePath = path.join(res.trim(), "node_modules", "@sandworm", "audit", "src", "registry", "npm.js");
let script = fs.readFileSync(filePath).toString();
script = script.replace(/const responseRaw = await fetch\(packageUrl\.href, \{\n *headers: \{\n *\.\.\.\(registryInfo\?\.token && \{Authorization: `Bearer \$\{registryInfo\.token}`}\),\n *},\n *}\);/,
`const responseRaw = await fetch(packageUrl.href, {
      headers: {
        ...(registryInfo?.token && { Authorization: \`Bearer \${registryInfo.token}\` }),
      },
      signal: AbortSignal.timeout(${process.argv[2] ?? 30_000})
    });
`);

fs.writeFileSync(filePath, script);