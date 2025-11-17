
use serde::Serialize;

use super::entity::*;
// use crate::Json;

impl<T: Serialize> ReqResult<T> {
    pub fn json(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }

    pub fn conn_error(data: T) -> Self {
        ReqResult { 
            success: false,
            code: -120,
            msg: "数据库连接失败".to_string(),
            data
        }
    }
}

impl History {
    pub fn json(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }
}

impl MapData {
    pub fn json(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }
}
impl<T: Serialize> PageData<T> {
    pub fn json(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }

    pub fn none() -> Self {
        PageData {
            total: 0,
            list: Vec::new(),
        }
    }
}