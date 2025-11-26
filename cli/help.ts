const tab = "  ";
console.log(`next-ove CLI v${process.env.npm_package_version}\n`);
console.log('COMPONENTS:');
['analyse', 'document', 'dev', 'db', 'lighthouse', 'test'].forEach(x => console.log(`${tab}${x}`));
console.log('\nFlags');
console.log(`${tab}-h, --help${tab} help for next-ove CLI`);
console.log(`\nUse "npm run COMPONENT -- --help" for more information about a command`)