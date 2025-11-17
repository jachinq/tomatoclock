use serde::{Deserialize, Serialize};

// use crate::Json;

// 允许结构体自动实现 Serialize trait
#[derive(Serialize, Deserialize, Debug)]
pub struct ReqResult<T> {
    pub success: bool,
    pub code: isize,
    pub msg: String,
    pub data: T,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct History {
    pub id: String,
    pub name: String,
    pub status: isize,
    pub total: isize,
    pub countdown: isize,
    pub minute: String,
    pub second: String,
    pub mark: String,
    pub time: isize,
    pub create: isize,
    pub update: isize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MapData {
    pub id: String,    
    pub config: String,
    // pub create: usize,
    // pub update: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PageData<T> {
    pub total: i64,
    pub list: Vec<T>
}