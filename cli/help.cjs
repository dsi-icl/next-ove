const version = require('../package.json').version;

const tab = "  ";
console.log(`next-ove CLI v${version}\n`);
console.log('COMPONENTS:');
['analyse', 'document', 'dev', 'db', 'lighthouse', 'test'].forEach(x => console.log(`${tab}${x}`));
console.log('\nFlags');
console.log(`${tab}-h, --help${tab} help for next-ove CLI`);
console.log(`\nUse "npm run COMPONENT -- --help" for more information about a command`)