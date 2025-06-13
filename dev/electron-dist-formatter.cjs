const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "..", "dist", "executables");
const appName = process.argv[2];
const arch = process.argv[3];
const version = process.argv[4];
const appDir = path.join(dir, `ove-${appName}-${arch}`);

const mv = (oldFilename, newFilename) => {
  fs.cpSync(path.join(dir, oldFilename), path.join(appDir, newFilename));
  fs.rmSync(path.join(dir, oldFilename));
};

const optionalArch = arch === "x64" ? "" : `-${arch}`;
const fullVersion = `${version}${optionalArch}`;
const rpmArch = arch === "arm64" ? "aarch64" : "x86_64";
const debArch = arch === "arm64" ? "arm64" : "amd64";

fs.rmSync(path.join(dir, ".icon-icns"), { recursive: true });
fs.rmSync(path.join(dir, ".icon-ico"), { recursive: true });
fs.rmSync(path.join(dir, `linux${optionalArch}-unpacked`), {recursive: true});
fs.rmSync(path.join(dir, `mac${optionalArch}`), {recursive: true});
fs.rmSync(path.join(dir, `win${optionalArch}-unpacked`), {recursive: true});
fs.rmSync(path.join(dir, "builder-debug.yml"), {recursive: true});
fs.rmSync(path.join(dir, "builder-effective-config.yaml"));
fs.rmSync(path.join(dir, `org.next-ove.${appName}.plist`));

fs.mkdirSync(appDir);

mv(`next-ove ${appName} Setup ${version}.exe`, `next-ove.${appName}.setup.${fullVersion}.exe`);
mv(`next-ove ${appName} Setup ${version}.exe.blockmap`, `next-ove.${appName}.setup.${fullVersion}.exe.blockmap`);
mv(`next-ove ${appName} ${version}.exe`, `next-ove.${appName}.${fullVersion}.exe`);
mv(`next-ove ${appName}-${fullVersion}.AppImage`, `next-ove.${appName}-${fullVersion}.AppImage`);
mv(`next-ove ${appName}-${fullVersion}.dmg`, `next-ove.${appName}-${fullVersion}.dmg`);
mv(`next-ove ${appName}-${fullVersion}.dmg.blockmap`, `next-ove.${appName}-${fullVersion}.dmg.blockmap`);
mv(`next-ove ${appName}-${fullVersion}.pkg`, `next-ove.${appName}-${fullVersion}.pkg`);
mv(`next-ove ${appName}-${fullVersion}-mac.zip`, `next-ove.${appName}-${fullVersion}-mac.zip`);
mv(`next-ove ${appName}-${fullVersion}-mac.zip.blockmap`, `next-ove.${appName}-${fullVersion}-mac.zip.blockmap`);
mv(`next-ove ${appName}-${fullVersion}-win.zip`, `next-ove.${appName}-${fullVersion}-win.zip`);
mv(`next-ove-${version}.${rpmArch}.rpm`, `next-ove-${appName}-${version}.${rpmArch}.rpm`);
mv(`next-ove_${version}_${debArch}.deb`, `next-ove_${appName}_${version}_${debArch}.deb`);