use std::{fs, path::Path};

use rusqlite::{Connection, Error, Result};

use crate::utils;

pub fn connect() -> Result<Connection> {
    let config_path = "./config/config.toml";
    let config = utils::read_config(config_path);
    let datasource = match config {
        Err(e) => {
            println!("get config error. path={} e = {:?}", config_path, e);
            "/home/admin/data/tomatoclock_sqlite.db".to_string()
        }
        Ok(config) => config.datasource,
    };
     // 创建数据库的文件夹
        let dir_path = Path::new(&datasource).parent().unwrap();
        if!dir_path.exists() {
            fs::create_dir_all(dir_path).unwrap();
        }
    Connection::open(datasource)
}

pub fn init_tables() {
    let init_tables = |conn: Connection| {
        let result: Result<(), Error> = conn.execute_batch(
            "BEGIN;
                CREATE TABLE if not exists history (
                    id TEXT NOT NULL DEFAULT '',
                    name TEXT NOT NULL DEFAULT '',
                    status INTEGER NOT NULL DEFAULT 0,
                    total INTEGER NOT NULL DEFAULT 0,
                    countdown INTEGER NOT NULL DEFAULT 0,
                    minute TEXT NOT NULL DEFAULT '',
                    second TEXT NOT NULL DEFAULT '',
                    mark TEXT NOT NULL DEFAULT '',
                    time INTEGER NOT NULL DEFAULT 0,
                    `create` INTEGER NOT NULL DEFAULT 0,
                    `update` INTEGER NOT NULL DEFAULT 0
                );
    
                CREATE TABLE if not exists map_data (
                    id TEXT NOT NULL DEFAULT '',
                    config TEXT NOT NULL DEFAULT '',
                    `create` INTEGER NOT NULL DEFAULT 0,
                    `update` INTEGER NOT NULL DEFAULT 0
                );
            COMMIT;",
        );
        match result {
            Err(e) => println!("init table error={e}"),
            _ => {}
        };
    };

    match connect() {
        Ok(conn) => init_tables(conn),
        Err(e) => println!("db connect error, {e}"),
    }
}

// 初始化默认数据
pub fn init_datas() {
    let init_datas = |conn: Connection| {
        let search_sql = "select * from map_data;";

        let insert_datas = || {
            let insert_sql = "
                BEGIN;
                INSERT INTO map_data (id,config) VALUES
                ('setting', '{\"dark\":true}'),
                ('tomato', '{}'),
                ('other', '{}');
                COMMIT;
            ";
            match conn.execute_batch(insert_sql) {
                Ok(_) => println!("init data ok."),
                Err(e) => println!("init data error. {e}"),
            }
        };

        let query = conn.query_row(search_sql, [], |_| Ok(()));
        match query {
            Err(_) => insert_datas(),
            _ => {},
        };
    };

    match connect() {
        Ok(conn) => init_datas(conn),
        Err(e) => println!("init datas error; {e}"),
    }
}

// pub fn create_table(sql: &str) -> Result<()> {
//     let conn = connect()?;
//     conn.execute(sql, ())?;
//     Ok(())
// }

// 匹配字段和占位符
pub fn turn_values(fields: String) -> String {
    let size = fields.split(",").collect::<Vec<&str>>().len() + 1;
    let mut values = String::new();
    for num in 1..size {
        values.push_str(&format!("?{}", num));
        if num == size - 1 {
            break;
        }
        values.push_str(",");
    }
    values
}

pub fn fmt_result(result: Result<usize, Error>) -> (bool, String, isize, usize) {
    let mut tunple = (true, "成功".to_string(), 0, 0);
    match result {
        Ok(size) => tunple.3 = size,
        Err(e) => {
            tunple.0 = false;
            tunple.1 = e.to_string();
            // match e {
            //     Error::SqliteFailure(_, _) => tunple.1 = "SqliteFailure".to_string(),
            //     Error::SqliteSingleThreadedMode => tunple.1 = "SqliteSingleThreadedMode".to_string(),
            //     Error::FromSqlConversionFailure(_, _, _) => tunple.1 = "FromSqlConversionFailure".to_string(),
            //     Error::IntegralValueOutOfRange(_, _) => tunple.1 = "IntegralValueOutOfRange".to_string(),
            //     Error::Utf8Error(_) => tunple.1 = "Utf8Error".to_string(),
            //     Error::NulError(_) => tunple.1 = "NulError".to_string(),
            //     Error::InvalidParameterName(_) => tunple.1 = "InvalidParameterName".to_string(),
            //     Error::InvalidPath(_) => tunple.1 = "InvalidPath".to_string(),
            //     Error::ExecuteReturnedResults => tunple.1 = "ExecuteReturnedResults".to_string(),
            //     Error::QueryReturnedNoRows => tunple.1 = "QueryReturnedNoRows".to_string(),
            //     Error::InvalidColumnIndex(_) => tunple.1 = "InvalidColumnIndex".to_string(),
            //     Error::InvalidColumnName(_) => tunple.1 = "InvalidColumnName".to_string(),
            //     Error::InvalidColumnType(_, _, _) => tunple.1 = "InvalidColumnType".to_string(),
            //     Error::StatementChangedRows(_) => tunple.1 = "StatementChangedRows".to_string(),
            //     Error::ToSqlConversionFailure(_) => tunple.1 = "ToSqlConversionFailure".to_string(),
            //     Error::InvalidQuery => tunple.1 = "InvalidQuery".to_string(),
            //     Error::MultipleStatement => tunple.1 = "MultipleStatement".to_string(),
            //     Error::InvalidParameterCount(_, _) => tunple.1 = "InvalidParameterCount".to_string(),
            //     Error::SqlInputError { error, msg, sql, offset } => tunple.1 = "SqlInputError".to_string(),
            //     _ => tunple.1 = "未知错误".to_string(),
            // }
        }
    }
    if !tunple.0 {
        tunple.2 = -1;
    }
    tunple
}
