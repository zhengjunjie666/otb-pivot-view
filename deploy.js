/**
 * OTB转置视图 一键更新+部署脚本
 * 
 * 功能：
 *   1. 从飞书拉取最新数据 → pivot_data.json
 *   2. 生成自包含HTML → otb_pivot_view_standalone.html
 *   3. Git提交+推送到远程仓库 → 触发Cloudflare Pages自动部署
 * 
 * 用法: node deploy.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GIT = '"C:\\Program Files\\Git\\bin\\git.exe"';
const DIR = path.dirname(__filename);

function run(cmd, options = {}) {
  console.log(`  > ${cmd}`);
  try {
    const result = execSync(cmd, { 
      encoding: 'utf8', 
      cwd: DIR,
      timeout: 60000,
      ...options 
    });
    return result.trim();
  } catch (e) {
    console.error(`  ERROR: ${e.message.slice(0, 200)}`);
    return null;
  }
}

console.log('========================================');
console.log('  OTB转置视图 一键更新+部署');
console.log('========================================\n');

// Step 1: Fetch latest data
console.log('[1/4] 拉取飞书最新数据...');
const fetchResult = run('node ' + path.join(DIR, 'fetch_pivot_data.js'));
if (fetchResult === null) {
  console.error('  数据拉取失败，终止部署');
  process.exit(1);
}
console.log('  数据拉取完成\n');

// Step 2: Build standalone HTML
console.log('[2/4] 生成自包含HTML...');
const buildResult = run('node ' + path.join(DIR, 'build_standalone_html.js'));
if (buildResult === null) {
  console.error('  HTML生成失败，终止部署');
  process.exit(1);
}
const fileSize = (fs.statSync(path.join(DIR, 'otb_pivot_view_standalone.html')).size / 1024).toFixed(0);
console.log(`  HTML生成完成 (${fileSize} KB)\n`);

// Step 3: Git add + commit
console.log('[3/4] Git提交...');
run(`${GIT} add otb_pivot_view_standalone.html index.html otb_pivot_view.html fetch_pivot_data.js build_standalone_html.js`);
const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
const commitMsg = `数据更新 ${now}`;
const commitResult = run(`${GIT} commit -m "${commitMsg}"`);
if (commitResult && commitResult.includes('nothing to commit')) {
  console.log('  没有数据变化，无需提交\n');
  console.log('========================================');
  console.log('  完成（无变化）');
  console.log('========================================');
  process.exit(0);
}
console.log(`  提交: "${commitMsg}"\n`);

// Step 4: Git push
console.log('[4/4] 推送到远程仓库...');
const pushResult = run(`${GIT} push`);
if (pushResult === null) {
  console.error('  推送失败，请检查网络或Git配置');
  process.exit(1);
}
console.log('  推送成功！\n');

console.log('========================================');
console.log('  部署完成!');
console.log('  Cloudflare Pages 将在1-2分钟内自动更新');
console.log('========================================');
