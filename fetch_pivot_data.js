const { execSync } = require('child_process');
const fs = require('fs');

const BASE_TOKEN = 'TlTVbNrINaXe6DsI11scBXicnDh';
const SRC_TABLE = 'tbl6vsEHRnLEwZin';

// Source table key field IDs
const SRC_F = {
  catCode: 'fldgBIUh3O',
  catName: 'flduOSqnym',
  month: 'fldun12OVx',
  monthSeq: 'fldxqBZUUx',
};

const MONTH_TO_M = {
  'Jan': 'M17', 'Feb': 'M18', 'Mar': 'M19', 'Apr': 'M20',
  'May': 'M21', 'Jun': 'M22', 'Jul': 'M23', 'Aug': 'M24',
  'Sep': 'M25', 'Oct': 'M26', 'Nov': 'M27', 'Dec': 'M28'
};

const MONTHS_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// All metrics with format type
const METRICS = {
  // Sales $ 整体销额
  'fldV2PMn2K': { name: 'OP Sales $', group: 'Sales $ 整体销额', source: '导入', fmt: 'amt' },
  'flddzbmu2O': { name: 'FC Sales $', group: 'Sales $ 整体销额', source: '输入', fmt: 'amt' },
  'fldmVBhhPm': { name: 'LF Sales $', group: 'Sales $ 整体销额', source: '外部脚本', fmt: 'amt' },
  'fldNrvzcob': { name: 'LY Sales $', group: 'Sales $ 整体销额', source: '导入', fmt: 'amt' },
  'fldEqTLhtq': { name: 'FC vs LY %', group: 'Sales $ 整体销额', source: '公式输出', fmt: 'pct' },
  'fldtGwgr0r': { name: 'LF vs LY %', group: 'Sales $ 整体销额', source: '公式输出', fmt: 'pct' },
  // Comp Sales $ 可比销额
  'fldI4x7dgD': { name: 'FC Comp Sales $', group: 'Comp Sales $ 可比销额', source: '输入', fmt: 'amt' },
  'flddNyta6k': { name: 'LF Comp Sales $', group: 'Comp Sales $ 可比销额', source: '输入', fmt: 'amt' },
  'fldaMnsYtH': { name: 'LY Comp Sales $', group: 'Comp Sales $ 可比销额', source: '导入', fmt: 'amt' },
  'fldVdKckXA': { name: 'Comp FC vs LY %', group: 'Comp Sales $ 可比销额', source: '公式输出', fmt: 'pct' },
  'fldTnQCHRw': { name: 'LF to Total Sales %', group: 'Comp Sales $ 可比销额', source: '公式输出', fmt: 'pct' },
  // Reg Sales $ 正价销额
  'fldJyW5VrG': { name: 'LF Reg Sales $', group: 'Reg Sales $ 正价销额', source: '输入', fmt: 'amt' },
  'fldvmGXRla': { name: 'LY Reg Sales $', group: 'Reg Sales $ 正价销额', source: '导入', fmt: 'amt' },
  'fldl5Dl3kC': { name: 'TY Reg %', group: 'Reg Sales $ 正价销额', source: '公式输出', fmt: 'pct' },
  'fldSZgdT9c': { name: 'LY Reg %', group: 'Reg Sales $ 正价销额', source: '公式输出', fmt: 'pct' },
  // Sales $ Build
  'fldYPCXcWy': { name: 'FC Sales $ Build', group: 'Sales $ Build 销售拉升', source: '输入', fmt: 'amt' },
  'fldFUcWVUc': { name: 'LF Sales $ Build', group: 'Sales $ Build 销售拉升', source: '输入', fmt: 'amt' },
  'flddoxxDGT': { name: 'LY Sales $ Build', group: 'Sales $ Build 销售拉升', source: '导入', fmt: 'amt' },
  // Disc Rate 折扣率
  'fldrzJdvf5': { name: 'LF Disc Rate', group: 'Disc Rate 折扣率', source: '输入', fmt: 'pct' },
  'fld69ZKuBy': { name: 'LY Disc Rate', group: 'Disc Rate 折扣率', source: '公式输出', fmt: 'pct' },
  'fldXWQ32dZ': { name: 'Promo Rate', group: 'Disc Rate 折扣率', source: '输入', fmt: 'pct' },
  'fldgPgqhXI': { name: 'MD Rate', group: 'Disc Rate 折扣率', source: '输入', fmt: 'pct' },
  'fldj69GTsG': { name: 'promo AMT LY', group: 'Disc Rate 折扣率', source: '导入', fmt: 'amt' },
  'fldyPUXqMk': { name: 'promo AMT LF', group: 'Disc Rate 折扣率', source: '输入', fmt: 'amt' },
  // Sales AUR 件单价
  'fldrF7MHq2': { name: 'FC Sales AUR', group: 'Sales AUR 件单价', source: '输入', fmt: 'prc' },
  'fldfWMORjy': { name: 'LF Sales AUR', group: 'Sales AUR 件单价', source: '公式输出', fmt: 'prc' },
  // Sales AUC 平均成本
  'fld5mRam9j': { name: 'FC Sales AUC', group: 'Sales AUC 平均成本', source: '输入', fmt: 'prc' },
  // Sales U 总销量
  'fldTTx9ARa': { name: 'FC Sales U', group: 'Sales U 总销量', source: '公式输出', fmt: 'qty' },
  'fld73Zh4S6': { name: 'LF Sales U', group: 'Sales U 总销量', source: '输入', fmt: 'qty' },
  'fldJKKAdvN': { name: 'REG/MD Ratio', group: 'Sales U 总销量', source: '输入', fmt: 'pct' },
  // Sales U Build
  'flduBqD7nE': { name: 'FC Sales U Build', group: 'Sales U Build 销量拉升', source: '输入', fmt: 'qty' },
  'fldq30lgSC': { name: 'LF Sales U Build', group: 'Sales U Build 销量拉升', source: '输入', fmt: 'qty' },
  // BOP U 期初库存件数
  'fldvU3i1sE': { name: 'FC BOP U', group: 'BOP U 期初库存件数', source: '公式输出', fmt: 'qty' },
  'fldrjOnUag': { name: 'LF BOP U', group: 'BOP U 期初库存件数', source: '输入', fmt: 'qty' },
  'fld6HC59Vi': { name: 'LY BOP U', group: 'BOP U 期初库存件数', source: '导入', fmt: 'qty' },
  'fldwvEDtqt': { name: 'BOP vs LY U %', group: 'BOP U 期初库存件数', source: '公式输出', fmt: 'pct' },
  // BOP AUI/AIC
  'fldYOx9nAn': { name: 'FC BOP AUI', group: 'BOP AUI/AIC 期初库存均价', source: '公式输出', fmt: 'prc' },
  'fld3aL5Jbn': { name: 'LF BOP AUI', group: 'BOP AUI/AIC 期初库存均价', source: '公式输出', fmt: 'prc' },
  'fldukcKxFO': { name: 'FC BOP AIC', group: 'BOP AUI/AIC 期初库存均价', source: '输入', fmt: 'prc' },
  'fldRRcjilH': { name: 'LF BOP AIC', group: 'BOP AUI/AIC 期初库存均价', source: '输入', fmt: 'prc' },
  'fldmzAgWIJ': { name: 'LY BOP AIC', group: 'BOP AUI/AIC 期初库存均价', source: '导入', fmt: 'prc' },
  // BOP $ 期初库存金额
  'fldAzip5Sw': { name: 'FC BOP $', group: 'BOP $ 期初库存金额', source: '公式输出', fmt: 'amt' },
  'fldYkqPn96': { name: 'LF BOP $', group: 'BOP $ 期初库存金额', source: '输入', fmt: 'amt' },
  'fldnKHGCoR': { name: 'LY BOP $', group: 'BOP $ 期初库存金额', source: '导入', fmt: 'amt' },
  // WOS U 库存可销周数
  'fldFKAtkbz': { name: 'LF WOS U', group: 'WOS U 库存可销周数', source: '公式输出', fmt: 'num' },
  'fldu1CJLK1': { name: 'LY WOS U', group: 'WOS U 库存可销周数', source: '公式输出', fmt: 'num' },
  'fldBGRC3hp': { name: 'WOS Excl MD >180', group: 'WOS U 库存可销周数', source: '公式输出', fmt: 'num' },
  // Receipt U 收货件数
  'fld2xw8jF3': { name: 'FC Receipt U', group: 'Receipt U 收货件数', source: '输入', fmt: 'qty' },
  'fldudoqfJX': { name: 'LF Receipt U', group: 'Receipt U 收货件数', source: '输入', fmt: 'qty' },
  'fldOn2v0o3': { name: 'RCVD Receipt U', group: 'Receipt U 收货件数', source: '导入', fmt: 'qty' },
  'fldkad6lHt': { name: 'FS OO U', group: 'Receipt U 收货件数', source: '导入', fmt: 'qty' },
  'fldCkpATXT': { name: 'Daily OO U', group: 'Receipt U 收货件数', source: '导入', fmt: 'qty' },
  'fldbvyMIHm': { name: 'LY Receipt U', group: 'Receipt U 收货件数', source: '导入', fmt: 'qty' },
  // Receipt AUR/AUC
  'fldvOCvVrV': { name: 'FC Receipt AUR', group: 'Receipt AUR/AUC 收货单价', source: '输入', fmt: 'prc' },
  'fldWRmPG3j': { name: 'LF Receipt AUR', group: 'Receipt AUR/AUC 收货单价', source: '输入', fmt: 'prc' },
  'fldSLv6RoG': { name: 'FS OO AUR', group: 'Receipt AUR/AUC 收货单价', source: '导入', fmt: 'prc' },
  'flduKxgDfQ': { name: 'LY Receipt AUR', group: 'Receipt AUR/AUC 收货单价', source: '导入', fmt: 'prc' },
  'fldPGn6TA0': { name: 'FC Receipt AUC', group: 'Receipt AUR/AUC 收货单价', source: '输入', fmt: 'prc' },
  'fldcEF848X': { name: 'LF Receipt AUC', group: 'Receipt AUR/AUC 收货单价', source: '输入', fmt: 'prc' },
  'fldbrOAzMV': { name: 'FS OO AUC', group: 'Receipt AUR/AUC 收货单价', source: '导入', fmt: 'prc' },
  'flduGYG2qS': { name: 'LY Receipt AUC', group: 'Receipt AUR/AUC 收货单价', source: '导入', fmt: 'prc' },
  // Receipt Cost $ 收货成本
  'fldOOHDot5': { name: 'FC Receipt Cost $', group: 'Receipt Cost $ 收货成本', source: '公式输出', fmt: 'amt' },
  'fldBhyreuw': { name: 'LF Receipt Cost $', group: 'Receipt Cost $ 收货成本', source: '公式输出', fmt: 'amt' },
  'fldMmhnXoY': { name: 'RCVD Receipt Cost $', group: 'Receipt Cost $ 收货成本', source: '公式输出', fmt: 'amt' },
  'fldCl9RztN': { name: 'LY Receipt Cost $', group: 'Receipt Cost $ 收货成本', source: '公式输出', fmt: 'amt' },
  'fld3GEoYuw': { name: 'FS OO Cost $', group: 'Receipt Cost $ 收货成本', source: '公式输出', fmt: 'amt' },
  // Receipt $ 收货金额
  'fldyGIcLtW': { name: 'FC Receipt $', group: 'Receipt $ 收货金额', source: '公式输出', fmt: 'amt' },
  'fldQvc8vJK': { name: 'LF Receipt $', group: 'Receipt $ 收货金额', source: '公式输出', fmt: 'amt' },
  'fldyAwcqRs': { name: 'RCVD Receipt $', group: 'Receipt $ 收货金额', source: '公式输出', fmt: 'amt' },
  'fldKmUG6Vd': { name: 'FS OO $', group: 'Receipt $ 收货金额', source: '公式输出', fmt: 'amt' },
  'fldwmXAKvg': { name: 'FC vs FS OO $', group: 'Receipt $ 收货金额', source: '公式输出', fmt: 'amt' },
  'fldXe81URc': { name: 'LY Receipt $', group: 'Receipt $ 收货金额', source: '导入', fmt: 'amt' },
  // IMU%
  'fld2mYKnHe': { name: 'FC IMU %', group: 'IMU% 定价毛利率', source: '输入', fmt: 'pct' },
  'fldQPyeW3I': { name: 'LF IMU %', group: 'IMU% 定价毛利率', source: '输入', fmt: 'pct' },
  'fldUWYMmUN': { name: 'LY IMU %', group: 'IMU% 定价毛利率', source: '导入', fmt: 'pct' },
  // GM%
  'fldFcOVjsu': { name: 'FC GM %', group: 'GM% 销售毛利率', source: '公式输出', fmt: 'pct' },
  'fldIiDJtI0': { name: 'LF GM %', group: 'GM% 销售毛利率', source: '公式输出', fmt: 'pct' },
  'fldaexpKtC': { name: 'LY GM %', group: 'GM% 销售毛利率', source: '导入', fmt: 'pct' },
  'fld3qcJ0tg': { name: 'Adjusted GM %', group: 'GM% 销售毛利率', source: '公式输出', fmt: 'pct' },
  // APS 单店平均
  'fldAO20Tvd': { name: 'FC Sales $ APS', group: 'APS 单店平均', source: '公式输出', fmt: 'amt' },
  'fldNsj2rqs': { name: 'LY Sales $ APS', group: 'APS 单店平均', source: '公式输出', fmt: 'amt' },
  'fldzP0ahGS': { name: 'Sales $ APS Var %', group: 'APS 单店平均', source: '公式输出', fmt: 'pct' },
  'fldOE3fSGS': { name: 'FC Sales U APS', group: 'APS 单店平均', source: '公式输出', fmt: 'qty' },
  'fldj0Cztlf': { name: 'LY Sales U APS', group: 'APS 单店平均', source: '公式输出', fmt: 'qty' },
  'fldmaL6oZe': { name: 'FC BOP U APS', group: 'APS 单店平均', source: '公式输出', fmt: 'qty' },
  'fldoAcChAS': { name: 'LY BOP U APS', group: 'APS 单店平均', source: '公式输出', fmt: 'qty' },
  'fldyFsxtuA': { name: 'FC BOP $ APS', group: 'APS 单店平均', source: '公式输出', fmt: 'amt' },
  'fldcrzfRj3': { name: 'LY BOP $ APS', group: 'APS 单店平均', source: '公式输出', fmt: 'amt' },
  // 参数与陈列
  'fldZeFv7of': { name: 'Stores TY', group: '参数与陈列', source: '导入', fmt: 'qty' },
  'fldDYtkbyA': { name: 'Comp Lookup', group: '参数与陈列', source: '导入', fmt: 'num' },
  'fldIM7etJZ': { name: 'Old Store Display $', group: '参数与陈列', source: '导入', fmt: 'amt' },
  'fldOgPdoAV': { name: 'New Store Display U', group: '参数与陈列', source: '导入', fmt: 'qty' },
  'fldSWg4wcY': { name: 'Old Store Display U', group: '参数与陈列', source: '导入', fmt: 'qty' },
  'fldNmllQlP': { name: 'Mid-Month Receipts', group: '参数与陈列', source: '输入', fmt: 'num' },
  // 库龄监控
  'fldeAhFRl7': { name: 'MD >180 Amt', group: '库龄监控', source: '导入', fmt: 'amt' },
};

// Fetch all records
function fetchAllRecords() {
  let allRecords = [];
  let offset = 0;
  while (true) {
    const cmd = `lark-cli base +record-list --base-token ${BASE_TOKEN} --table-id ${SRC_TABLE} --limit 100 --offset ${offset}`;
    const out = execSync(cmd, { encoding: 'utf8' });
    const j = JSON.parse(out);
    const records = j.data.data || [];
    const fieldIds = j.data.field_id_list || [];
    const recordIds = j.data.record_id_list || [];
    if (records.length === 0) break;
    for (let i = 0; i < records.length; i++) {
      const vals = records[i];
      const fields = {};
      for (let k = 0; k < fieldIds.length; k++) {
        fields[fieldIds[k]] = vals[k];
      }
      allRecords.push({ id: recordIds[i], fields });
    }
    offset += records.length;
    console.log('Fetched', allRecords.length, '...');
    if (!j.data.has_more) break;
  }
  return allRecords;
}

// Pivot: rows = category × metric, columns = months
function pivotData(records) {
  const categories = {}; // catCode -> catName
  const pivot = {}; // key: catCode|metricName -> { catCode, catName, metricName, metricGroup, dataSource, fmt, months: {Jan: val, ...} }

  for (const rec of records) {
    const catCode = rec.fields[SRC_F.catCode] || '';
    const catName = rec.fields[SRC_F.catName] || '';
    if (typeof catName === 'object' && Array.isArray(catName)) catName = catName[0] || '';
    const month = rec.fields[SRC_F.month];
    let monthName = '';
    if (Array.isArray(month)) monthName = month[0];
    else if (typeof month === 'string') monthName = month;
    if (!MONTH_TO_M[monthName]) continue;

    if (catCode && !categories[catCode]) categories[catCode] = catName;

    for (const [fieldId, metricInfo] of Object.entries(METRICS)) {
      const val = rec.fields[fieldId];
      const pivotKey = catCode + '|' + metricInfo.name;

      if (!pivot[pivotKey]) {
        pivot[pivotKey] = {
          catCode, catName,
          metricName: metricInfo.name,
          metricGroup: metricInfo.group,
          dataSource: metricInfo.source,
          fmt: metricInfo.fmt,
          months: {}
        };
      }

      let numVal = null;
      if (val === null || val === undefined || val === '') numVal = null;
      else if (typeof val === 'number') numVal = val;
      else if (typeof val === 'string') { const p = parseFloat(val); numVal = isNaN(p) ? null : p; }
      else if (Array.isArray(val)) numVal = null;

      pivot[pivotKey].months[monthName] = numVal;
    }
  }

  return { categories, pivotRows: Object.values(pivot) };
}

// Main
console.log('Fetching records...');
const records = fetchAllRecords();
console.log('Total source records:', records.length);

console.log('Pivoting data...');
const { categories, pivotRows } = pivotData(records);
console.log('Categories:', Object.keys(categories).length);
console.log('Pivot rows:', pivotRows.length);

// Group metrics by group
const groups = {};
for (const row of pivotRows) {
  if (!groups[row.metricGroup]) groups[row.metricGroup] = [];
  groups[row.metricGroup].push(row.metricName);
}
console.log('Metric groups:', Object.keys(groups).length);

// Save JSON for HTML generation
// Metric display order (matching OTB Excel layout)
const METRIC_ORDER = [
  // Sales $ 整体销额
  'OP Sales $', 'FC Sales $', 'LF Sales $', 'LY Sales $', 'FC vs LY %', 'LF vs LY %',
  // Comp Sales $ 可比销额
  'FC Comp Sales $', 'LF Comp Sales $', 'LY Comp Sales $', 'Comp FC vs LY %', 'LF to Total Sales %',
  // Reg Sales $ 正价销额
  'LF Reg Sales $', 'LY Reg Sales $', 'TY Reg %', 'LY Reg %',
  // Sales $ Build
  'FC Sales $ Build', 'LF Sales $ Build', 'LY Sales $ Build',
  // Disc Rate 折扣率
  'LF Disc Rate', 'LY Disc Rate', 'Promo Rate', 'MD Rate', 'promo AMT LY', 'promo AMT LF',
  // Sales AUR 件单价
  'FC Sales AUR', 'LF Sales AUR',
  // Sales AUC 平均成本
  'FC Sales AUC',
  // Sales U 总销量
  'FC Sales U', 'LF Sales U', 'REG/MD Ratio',
  // Sales U Build
  'FC Sales U Build', 'LF Sales U Build',
  // BOP U 期初库存件数
  'FC BOP U', 'LF BOP U', 'LY BOP U', 'BOP vs LY U %',
  // BOP AUI/AIC
  'FC BOP AUI', 'LF BOP AUI', 'FC BOP AIC', 'LF BOP AIC', 'LY BOP AIC',
  // BOP $ 期初库存金额
  'FC BOP $', 'LF BOP $', 'LY BOP $',
  // WOS U 库存可销周数
  'LF WOS U', 'LY WOS U', 'WOS Excl MD >180',
  // Receipt U 收货件数
  'FC Receipt U', 'LF Receipt U', 'RCVD Receipt U', 'FS OO U', 'Daily OO U', 'LY Receipt U',
  // Receipt AUR/AUC
  'FC Receipt AUR', 'LF Receipt AUR', 'FS OO AUR', 'LY Receipt AUR',
  'FC Receipt AUC', 'LF Receipt AUC', 'FS OO AUC', 'LY Receipt AUC',
  // Receipt Cost $ 收货成本
  'FC Receipt Cost $', 'LF Receipt Cost $', 'RCVD Receipt Cost $', 'LY Receipt Cost $', 'FS OO Cost $',
  // Receipt $ 收货金额
  'FC Receipt $', 'LF Receipt $', 'RCVD Receipt $', 'FS OO $', 'FC vs FS OO $', 'LY Receipt $',
  // IMU%
  'FC IMU %', 'LF IMU %', 'LY IMU %',
  // GM%
  'FC GM %', 'LF GM %', 'LY GM %', 'Adjusted GM %',
  // APS 单店平均
  'FC Sales $ APS', 'LY Sales $ APS', 'Sales $ APS Var %',
  'FC Sales U APS', 'LY Sales U APS',
  'FC BOP U APS', 'LY BOP U APS',
  'FC BOP $ APS', 'LY BOP $ APS',
  // 参数与陈列
  'Stores TY', 'Comp Lookup', 'Old Store Display $', 'New Store Display U', 'Old Store Display U', 'Mid-Month Receipts',
  // 库龄监控
  'MD >180 Amt',
];

const output = {
  categories,
  pivotRows,
  groups,
  monthsOrder: MONTHS_ORDER,
  metricOrder: METRIC_ORDER
};
fs.writeFileSync('pivot_data.json', JSON.stringify(output));
console.log('Saved to pivot_data.json');
