use std::collections::HashMap;

use crate::{sqlite, utils};
use rusqlite::{params, Connection};

use super::entity::*;

impl History {
    pub fn parse(params: HashMap<String, String>) -> Self {
        History {
            id: utils::parse_string(&params, "id", ""),
            name: utils::parse_string(&params, "name", ""),
            status: utils::parse_int(&params, "status", 2),
            total: utils::parse_int(&params, "total", 0),
            countdown: utils::parse_int(&params, "countdown", 0),
            minute: utils::parse_string(&params, "minute", ""),
            second: utils::parse_string(&params, "second", ""),
            mark: utils::parse_string(&params, "mark", ""),
            time: utils::parse_int(&params, "time", 0),
            create: utils::parse_int(&params, "create", 0),
            update: utils::parse_int(&params, "update", 0),
        }
    }

    pub fn add(params: HashMap<String, String>) -> ReqResult<Self> {
        let history = History::parse(params);

        // 业务逻辑
        let add = |conn: Connection, history: History| {
            let fields = "id,name,status,total,countdown,minute,second,mark,time,`create`,`update`";
            let values = sqlite::turn_values(fields.to_string());

            let (success, msg, code, rows) = sqlite::fmt_result(conn.execute(
                &format!("INSERT INTO history ({}) VALUES ({})", fields, values),
                params![
                    history.id,
                    history.name,
                    history.status,
                    history.total,
                    history.countdown,
                    history.minute,
                    history.second,
                    history.mark,
                    history.time,
                    history.create,
                    history.update,
                ],
            ));
            let _ = conn.close();

            println!(
                "add history end; data={:?} rows={} success={} msg={}",
                history, rows, success, msg
            );
            ReqResult {
                success,
                code,
                msg,
                data: history,
            }
        };

        // 成功连接数据库后执行业务逻辑
        match sqlite::connect() {
            Ok(conn) => add(conn, history),
            Err(_) => ReqResult::conn_error(history),
        }
    }

    pub fn get(id: String) -> ReqResult<Option<History>> {
        let get = |conn: Connection| {
            let mut stmt = conn.prepare("SELECT * FROM history WHERE id = ?1").unwrap();
            let iter = stmt
                .query_map(params![id], |row| {
                    Ok(History {
                        id: row.get_unwrap(0),
                        name: row.get_unwrap(1),
                        status: row.get_unwrap(2),
                        total: row.get_unwrap(3),
                        countdown: row.get_unwrap(4),
                        minute: row.get_unwrap(5),
                        second: row.get_unwrap(6),
                        mark: row.get_unwrap(7),
                        time: row.get_unwrap(8),
                        create: row.get_unwrap(9),
                        update: row.get_unwrap(10),
                    })
                })
                .unwrap();

            let mut history = None;
            for some_folder in iter {
                // println!("Found person {:?}", folder.unwrap());
                match some_folder {
                    Ok(folder) => {
                        // println!("his {}", folder.json());
                        history = Some(folder);
                    }
                    Err(e) => println!("e={}", e),
                }
            }

            ReqResult {
                success: true,
                code: 0,
                msg: "查询成功".to_string(),
                data: history,
            }
        };

        match sqlite::connect() {
            Ok(conn) => get(conn),
            Err(_) => ReqResult::conn_error(None),
        }
    }

    pub fn get_all(beg: isize, end: isize, start: isize, limit: isize) -> ReqResult<PageData<Self>> {
        let mut condition = String::new();
        if beg > 0 {
            if condition != "" {
                condition.push_str(" and ");
            }
            condition.push_str("`create`>=");
            condition.push_str(&beg.to_string());
        }
        if end > 0 {
            if condition != "" {
                condition.push_str(" and ");
            }
            condition.push_str("`create`<=");
            condition.push_str(&end.to_string());
        }

        let mut sql = "SELECT * FROM history".to_string();
        if condition != "" {
            sql += " where ";
            sql += &condition;
        }
        sql += " order by `create` desc ";
        if limit > 0 {
            sql += " limit ";
            sql += &start.to_string();
            sql += ",";
            sql += &limit.to_string();
            sql += ";";
        }

        let mut count_sql = "SELECT COUNT(*) as count FROM history".to_string();
        if condition != "" {
            count_sql += " where ";
            count_sql += &condition;
        }

        println!("sql==={sql} count_sql={count_sql}");

        let get_all = |conn: Connection| {
            let mut stmt = conn.prepare(&sql).unwrap();

            let iter = stmt
                .query_map(params![], |row| {
                    let data = Self {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        status: row.get(2)?,
                        total: row.get(3)?,
                        countdown: row.get(4)?,
                        minute: row.get(5)?,
                        second: row.get(6)?,
                        mark: row.get(7)?,
                        time: row.get(8)?,
                        create: row.get(9)?,
                        update: row.get(10)?,
                    };
                    // println!("data={}", data.json());
                    Ok(data)
                })
                .unwrap();

            let mut total = 0;
            let _ = conn.query_row(&count_sql, [], |row| {
                println!("row={:?}", row);
                total = row.get_ref(0)?.as_i64()?;
                Ok(())
            });

            let mut list: Vec<Self> = Vec::new();

            for some in iter {
                match some {
                    Ok(data) => list.push(data),
                    Err(e) => {
                        println!("e={}", e);
                    }
                }
            }

            ReqResult {
                success: true,
                code: 0,
                msg: "查询成功".to_string(),
                data: PageData {
                    total,
                    list,
                },
            }
        };

        match sqlite::connect() {
            Ok(conn) => get_all(conn),
            Err(_) => ReqResult::conn_error(PageData::none()),
        }
    }

    pub fn set(params: HashMap<String, String>) -> ReqResult<Self> {
        let history = History::parse(params);

        let set = |conn: Connection, history: History| {
            let (success, msg, code, rows) = sqlite::fmt_result(conn.execute(
                "UPDATE history SET name = ?1, mark = ?2 WHERE id = ?3",
                params![history.name, history.mark, history.id],
            ));
            println!(
                "set history end; rows={:?} info={:?} success={} msg={}",
                rows, history, success, msg
            );
            ReqResult {
                success,
                code,
                msg,
                data: history,
            }
        };
        match sqlite::connect() {
            Ok(conn) => set(conn, history),
            Err(_) => ReqResult::conn_error(history),
        }
    }

    pub fn del(id: String) -> ReqResult<String> {
        let del = |conn: Connection, id: String| {
            let (success, msg, code, rows) =
                sqlite::fmt_result(conn.execute("DELETE FROM history WHERE id = ?1", params![id]));
            println!(
                "del history end; rows={:?} id={:?} success={} msg={}",
                rows, id, rows, msg
            );
            let msg = if success {
                "删除成功, 行数=".to_string() + &rows.to_string()
            } else {
                msg
            };
            ReqResult {
                success,
                code,
                msg,
                data: id,
            }
        };
        match sqlite::connect() {
            Ok(conn) => del(conn, id),
            Err(_) => ReqResult::conn_error(id),
        }
    }
}

impl MapData {
    pub fn parse(params: HashMap<String, String>) -> Self {
        MapData {
            id: utils::parse_string(&params, "id", ""),
            config: utils::parse_string(&params, "config", "{}"),
        }
    }

    pub fn add(params: HashMap<String, String>) -> ReqResult<Self> {
        let data = MapData::parse(params);

        let fields = "id,config";
        let values = sqlite::turn_values(fields.to_string());

        let add = |conn: Connection, data: MapData| {
            let (success, msg, code, rows) = sqlite::fmt_result(conn.execute(
                &format!("INSERT INTO map_data ({}) VALUES ({})", fields, values),
                params![data.id, data.config,],
            ));
            let _ = conn.close();
            println!(
                "add map_data end; data={:?} rows={:?} success={} msg={}",
                data, rows, success, msg
            );

            ReqResult {
                success,
                code,
                msg: if success {
                    "添加成功".to_string()
                } else {
                    msg.to_string()
                },
                data,
            }
        };

        match sqlite::connect() {
            Ok(conn) => add(conn, data),
            Err(_) => ReqResult::conn_error(data),
        }
    }

    pub fn set(params: HashMap<String, String>) -> ReqResult<Self> {
        let data = MapData::parse(params);

        let set = |conn: Connection, data: MapData| {
            let (success, msg, code, rows) = sqlite::fmt_result(conn.execute(
                "UPDATE map_data SET config = ?1 WHERE id = ?2",
                params![data.config, data.id],
            ));
            println!(
                "set map_data end; data={:?} rows={:?} success={} msg={}",
                data, rows, success, msg
            );
            ReqResult {
                success,
                code,
                msg: if success {
                    "修改成功".to_string()
                } else {
                    msg
                },
                data,
            }
        };
        match sqlite::connect() {
            Ok(conn) => set(conn, data),
            Err(_) => ReqResult::conn_error(data),
        }
    }

    pub fn get(id: String) -> ReqResult<Option<Self>> {
        let get = |conn: Connection, id: String| {
            let mut stmt = conn
                .prepare("SELECT * FROM map_data WHERE id = ?1 limit 1;")
                .unwrap();
            let iter = stmt
                .query_map(params![id], |row| {
                    Ok(MapData {
                        id: row.get_unwrap(0),
                        config: row.get_unwrap(1),
                    })
                })
                .unwrap();

            let mut data = None;
            for item_res in iter {
                // println!("Found person {:?}", folder.unwrap());
                match item_res {
                    Ok(item) => {
                        // println!("his {}", folder.json());
                        data = Some(item);
                    }
                    Err(e) => println!("e={}", e),
                }
            }

            ReqResult {
                success: true,
                code: 0,
                msg: "查询成功".to_string(),
                data,
            }
        };
        match sqlite::connect() {
            Ok(conn) => get(conn, id),
            Err(_) => ReqResult::conn_error(None),
        }
    }
}
