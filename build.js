// build.js - Zero-dependency build script for Chrome and Firefox
// Usage: node build.js [chrome|firefox|all|watch|package]
// Default: all

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const BUILD = path.join(ROOT, 'build');
const DIST = path.join(ROOT, 'dist');
const VERSION = require('./package.json').version;

const TARGETS = {
    chrome: 'manifest.chrome.json',
    firefox: 'manifest.firefox.json'
};

const TSC_OUT = path.join(BUILD, '.tsc');

const ASSETS = [
    '_locales',
    'icons'
];

const COMPILED = [
    'background.js',
    'scripts'
];

function cleanDir(dir)
{
    if (fs.existsSync(dir))
    {
        fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest)
{
    const stat = fs.statSync(src);
    if (stat.isDirectory())
    {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src))
        {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    }
    else
    {
        fs.copyFileSync(src, dest);
    }
}

function compile()
{
    console.log('Compiling TypeScript...');
    execSync('npx tsc', { cwd: ROOT, stdio: 'inherit' });
}

function buildTarget(target)
{
    console.log(`Building ${target}...`);

    const outDir = path.join(BUILD, target);
    cleanDir(outDir);

    for (const entry of ASSETS)
    {
        copyRecursive(path.join(SRC, entry), path.join(outDir, entry));
    }

    for (const entry of COMPILED)
    {
        copyRecursive(path.join(TSC_OUT, entry), path.join(outDir, entry));
    }

    const base = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.base.json'), 'utf-8'));
    const override = JSON.parse(fs.readFileSync(path.join(SRC, TARGETS[target]), 'utf-8'));
    const merged = { ...base, ...override };

    fs.writeFileSync(
        path.join(outDir, 'manifest.json'),
        JSON.stringify(merged, null, 4) + '\n'
    );

    console.log(`  -> ${outDir}`);
}

function packageTarget(target)
{
    return new Promise((resolve, reject) =>
    {
        const sourceDir = path.join(BUILD, target);

        if (!fs.existsSync(sourceDir))
        {
            reject(new Error(`Build directory not found: ${sourceDir}. Run "node build.js ${target}" first.`));
            return;
        }

        const extensions = target === 'firefox' ? ['zip', 'xpi'] : ['zip'];
        let remaining = extensions.length;

        for (const ext of extensions)
        {
            const fileName = `twitch-improvement-${VERSION}-${target}.${ext}`;
            const filePath = path.join(DIST, fileName);

            const output = fs.createWriteStream(filePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () =>
            {
                const sizeKB = (archive.pointer() / 1024).toFixed(1);
                console.log(`  -> ${filePath} (${sizeKB} KB)`);
                if (--remaining === 0) resolve();
            });

            archive.on('error', (err) =>
            {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        }
    });
}

async function packageAll()
{
    console.log('Packaging...');
    cleanDir(DIST);
    for (const target of Object.keys(TARGETS))
    {
        console.log(`Packaging ${target}...`);
        await packageTarget(target);
    }
}

function buildAll()
{
    compile();
    for (const target of Object.keys(TARGETS))
    {
        buildTarget(target);
    }
}

function watch()
{
    buildAll();
    console.log(`Watching ${SRC} for changes...`);

    let timeout = null;
    fs.watch(SRC, { recursive: true }, () =>
    {
        if (timeout) return;
        timeout = setTimeout(() =>
        {
            timeout = null;
            console.log('');
            buildAll();
        }, 200);
    });
}

const arg = process.argv[2] || 'all';

switch (arg)
{
    case 'all':
        buildAll();
        break;
    case 'watch':
        watch();
        break;
    case 'package':
        buildAll();
        packageAll().then(() =>
        {
            console.log('Done.');
        });
        break;
    default:
        if (TARGETS[arg])
        {
            compile();
            buildTarget(arg);
        }
        else
        {
            console.error(`Unknown target: ${arg}`);
            console.error('Usage: node build.js [chrome|firefox|all|watch|package]');
            process.exit(1);
        }
}

if (arg !== 'watch' && arg !== 'package') console.log('Done.');
