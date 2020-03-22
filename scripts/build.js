#!/usr/bin/env node

const { join } = require('path');
const { execSync } = require('child_process');
const {
  readFileSync,
  writeFileSync,
  createWriteStream,
  existsSync,
  move,
  remove,
} = require('fs-extra');

const archiver = require('archiver');
const { green, gray, yellow } = require('kleur');

const { BROWSER } = process.env;

function getGitCommit() {
  return execSync('git rev-parse --short HEAD')
    .toString()
    .trim();
}

function buildForProduction(rootPath, outputPath) {
  const webpackBinaryPath = join(rootPath, 'node_modules', '.bin', 'webpack');

  execSync(
    `${webpackBinaryPath} --mode=production --browser=${BROWSER} --output-path=${outputPath} --display=errors-only`,
    {
      cwd: rootPath,
      env: process.env,
      stdio: 'inherit',
    },
  );
  console.log(gray('- The source has been successfully built for production use'));
}

function updateManifestDescription(manifestPath) {
  const commit = getGitCommit();
  const dateString = new Date().toLocaleDateString();
  const manifest = JSON.parse(readFileSync(manifestPath).toString());

  manifest.description += `\n\nCreated from revision ${commit} on ${dateString}.`;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(gray('- The manifest file successfully updated.'));
}

function pack(sourcePath, destinationPath) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const zipStream = createWriteStream(destinationPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourcePath, false)
      .on('error', err => reject(err))
      .pipe(zipStream);

    archive.finalize();
    zipStream.on('close', () => {
      console.log(gray('- Extension successfully packed for deployment.'));
      resolve();
    });
  });
}

async function cleanup(path) {
  if (existsSync(path)) {
    await remove(path);
    console.log(gray('- Previous build has been successfully removed'));
  }
}

const build = async () => {
  const root = join(__dirname, '..');
  const deployPath = join(root, 'deploy');
  const buildPath = join(deployPath, BROWSER);

  console.log(green(`Building ${BROWSER} extension\n`));

  // step 0: Clean up the old builds
  await cleanup(buildPath);

  // step 1: Build the source
  buildForProduction(root, buildPath);

  // step 2: Update the manifest
  const copiedManifestPath = join(buildPath, 'manifest.json');
  updateManifestDescription(copiedManifestPath);

  // step 3: Pack the extension
  const zipName = `${BROWSER}.zip`;
  const zipPath = join(buildPath, '..', zipName);
  await pack(buildPath, zipPath);

  // step 4: Move zip file to build
  move(zipPath, join(buildPath, zipName));

  console.log(yellow(`\nBuild: ${buildPath}`));
};

// Let's do this :)
(async () => {
  try {
    await build();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
