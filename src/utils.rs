use std::{collections::HashMap, fs};

use serde::Deserialize;


// 解析参数
pub fn parse_int(params: &HashMap<String, String>, key: &str, default: isize) -> isize{
	let value = match params.get(key) {
		Some(value_str) => 
			match value_str.to_string().parse() {
				Ok(value) => value,
				Err(_) => default,
			},
		None => default,
	};
	// let value = String::from(params.get(key).unwrap().to_string()).parse().unwrap();
	value
}
pub fn parse_string(params: &HashMap<String, String>, key: &str, default: &str) -> String{
	let value = match params.get(key) {
		Some(value_str) => value_str.to_string(),
		None => default.to_string(),
	};
	// let value = String::from(params.get(key).unwrap().to_string()).parse().unwrap();
	value
}

/// 统一错误类
#[derive(Debug)]
pub enum Error {
    ParseError,
    SqlError(String),
    ConfigError(String),
    ArgError(String),
}

/// 配置文件
#[derive(Debug, Deserialize)]
pub struct Config {
    pub datasource: String,
    pub webdir: Option<String>,
    pub port: Option<u16>,
}


/// 读取指定路径的配置文件，配置文件使用 toml 进行解析
pub fn read_config(path: &str) -> Result<Config, Error> {
    if let Err(e) = fs::exists(path) {
        return Err(Error::ConfigError(format!("path={}, e={:?}", path, e)));
    }
    let file = fs::read(path);
    if let Err(e) = file {
        return Err(Error::ConfigError(format!("path={}, e={:?}", path, e)));
    }
    let file = file.unwrap();
    let config = toml::from_slice(&file);
    if let Err(e) = config {
        return Err(Error::ConfigError(format!("parse config {:?}", e)));
    }
    let config: Config = config.unwrap();
    println!("{:?}", config);
    Ok(config)
}
