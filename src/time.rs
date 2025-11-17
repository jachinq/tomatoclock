// chrono = "0.4.24"
// #![allow(dead_code)]
// #![allow(unused_variables)]
// #[allow(unused_imports)]

// use chrono::prelude::*;
// use chrono::LocalResult;

// // 获取当前时间戳
// pub fn get_now_time() -> i64 {
//     let now: DateTime<Local> = Local::now();
//     let mills: i64 = now.timestamp_millis(); //获取当前毫秒值 
//     mills
// }

// // 根据时间戳格式化当前时间
// pub fn format(mills: i64) -> String {
//     match Local.timestamp_millis_opt(mills) {
//         LocalResult::Single(dt) => dt.format("%Y-%m-%d %H:%M:%S").to_string(),
//         _ => "".to_string(),
//     }
//     // let dt: DateTime<Local> = 
//     // dt.format("%Y-%m-%d %H:%M:%S").to_string()
// }
