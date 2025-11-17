use std::collections::HashMap;


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