'use strict';

const loopback = require('loopback');
const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));

const DATASOURCE_NAME = 'mysql_ktxh_caphuyen_custom';
const DB_NAME = 'ktxh_caphuyen_custom';
const dataSourceConfig = require('../server/datasources.json');
const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME]);

discover().then(
  success => process.exit(),
  error => { console.error('UNHANDLED ERROR:\n', error); process.exit(1); },
);


async function discover() {
  // It's important to pass the same "options" object to all calls
  // of dataSource.discoverSchemas(), it allows the method to cache
  // discovered related models

  // load config model
  const configJson = await readFile('server/model-config.json', 'utf-8');
  const config = JSON.parse(configJson);
  const options = {relations: true};
  await mkdirp('../common/models');

  async function discoverSchema(tableName) {
    let tableSchema = await db.discoverSchemas(tableName, options);
    tableSchema = tableSchema[`${DB_NAME}.${tableName}`];
    await writeFile(
      `common/models/${tableName}.json`,
      JSON.stringify(tableSchema, null, 2)
    );
    console.log(tableSchema)
    config[tableSchema['name']] = {dataSource: DATASOURCE_NAME, public: true};
  }
  let tableNames = [
      'dbo_bieunhaplieu',
      'dbo_bieunhaplieu_chitieu',
      'dbo_bieunhaplieu_donvinhap',
      'dbo_bieunhaplieu_donvitonghop',
      'dbo_bieunhaplieu_donvitonghopcaphuyen',
      'dbo_bieunhaplieu_donvitonghopcaptinh',
      'dbo_bieunhaplieu_kybaocao',
      'dbo_bieunhaplieu_truongnhaplieu',
      'dbo_chitieu',
      'dbo_chitieunhom',
      'dbo_chitieuphanto',
      'dbo_chitieuphantochitiet',
      'dbo_datadetail',
      'dbo_datamaster',
      'dbo_datastatus',
      'dbo_qc_donvinhom',
      'dbo_qc_huyen',
      'dbo_qc_tinh',
      'dbo_qc_xa',
      'dbo_ql_kybaocao',
      'dbo_qt_chucnangphanmem',
      'dbo_qt_donvi',
      'dbo_qt_donvi_diaban',
      'dbo_qt_hopthuhoidap',
      'dbo_qt_namlamviec',
      'dbo_qt_tacnhan',
      'dbo_qt_tacnhan_chucnangphanmem',
      'dbo_qt_users',
      'dbo_qt_users_tacnhan',
      'dbo_sys_caphanhchinh',
      'dbo_sys_datastatus',
      'dbo_sys_kybaocao',
      'dbo_sys_loaibieunhaplieu',
      'dbo_sys_loaitruongdulieu',
      'dbo_sys_nguonsolieu',
      'dbo_sys_nhaplieu_01',
      'dbo_sys_trangthaidongmo',
      'dbo_truongnhaplieu'
  ]
  for(let tableName of tableNames) {
    await discoverSchema(tableName);
  }

  // Expose models via REST API
  await writeFile(
    'server/model-config.json',
    JSON.stringify(config, null, 2)
  );
}
