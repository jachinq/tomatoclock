use std::{collections::HashMap, fs::File};
use tiny_http::{Header, Request, Response, Server};
use tomaotclock::{entity::*, sqlite, utils};
use urlencoding::decode;

fn main() {
    sqlite::init_tables();
    sqlite::init_datas();

    match Server::http("0.0.0.0:8080") {
        Err(_) => println!("start server error;check port is alread used?"),
        Ok(server) => {
            let html_dir = "./web/"; // 指定你的静态文件目录
            for request in server.incoming_requests() {
                let mut content_type = "";
                let mut is_api = false;
                let start_url = request.url().trim_start_matches('/');
                let file_name = match start_url {
                    "" | "index.html" => {
                        format!("{}index.html", html_dir)
                    }
                    somthing => {
                        // content_type = "";
                        is_api = somthing.contains("api/");
                        if somthing.contains("assets/") && somthing.contains(".js") {
                            content_type = "text/javascript; charset=UTF-8";
                        }
                        if somthing.contains("assets/") && somthing.contains(".css") {
                            content_type = "text/css; charset=UTF-8";
                        }
                        if somthing.contains(".svg") {
                            content_type = "image/svg+xml";
                        }
                        if !is_api {
                            println!("other file={}", somthing);
                        }
                        format!("{}{}", html_dir, somthing)
                    }
                };

                if is_api {
                    handle_api(request);
                } else {
                    println!("file={}", file_name);
                    match File::open(file_name) {
                        Ok(file) => {
                            let mut response = Response::from_file(file);
                            // response.with_status_code(200);
                            response.add_header(
                                Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..])
                                    .unwrap(),
                            );
                            if content_type != "" {
                                response.add_header(
                                    Header::from_bytes(&b"Content-Type"[..], &content_type[..])
                                        .unwrap(),
                                );
                            }
                            let _ = request.respond(response);
                        }
                        Err(e) => {
                            println!("open file error = {}", e);
                            let _ = request.respond(Response::from_string(
                                "error".to_string() + &e.to_string(),
                            ));
                        }
                    }
                }
            }
        }
    }
}

fn handle_api(mut request: Request) {
    println!(
        "request: method: {:?}, url: {:?}", // headers: {:?}",
        request.method(),
        request.url(),
        // request.headers()
    );

    let mut body = String::new();
    let _ = request.as_reader().read_to_string(&mut body);

    let url = request.url();
    let params = parse_request(&body);
    let result: String = handle_request(url, params);
    let mut response: Response<std::io::Cursor<Vec<u8>>> = Response::from_string(result);
    response
        .add_header(Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
    let _ = request.respond(response);
}

// 解析 url 地址，返回 url 和请求参数体的元组
fn parse_request(body: &str) -> HashMap<String, String> {
    // println!("bug====={}", buf);
    // let parse = decode(&body).expect("UTF-8"); // 解码
    let parse = body;
    // println!("decode====={}", a);
    let mut params = HashMap::new();

    for kv in parse.split("&").collect::<Vec<&str>>().iter() {
        let kv_string = kv.to_string();
        let kv_split = kv_string.split("=").collect::<Vec<&str>>();
        if kv_split.len() == 1 {
            params.insert(kv_split[0].to_string(), "".to_string());
        } else if kv_split.len() > 1 {
            params.insert(
                kv_split[0].to_string(),
                decode(kv_split[1]).expect("UTF-8").to_string(),
            );
        }
    }

    if parse != "" {
        println!("解析参数 args={:?} params={:?}", parse, params);
    }

    params
}

// 转发请求到不同的方法进行处理
fn handle_request(url: &str, params: HashMap<String, String>) -> String {
    match &url.replace("api/", "") as &str {
        "/test" => test(),
        "/add_config" => add_config(params),
        "/set_config" => set_config(params),
        "/get_config" => get_config(params),
        "/add_history" => add_history(params),
        "/set_history" => set_history(params),
        "/del_history" => del_history(params),
        "/get_history" => get_history(params),
        "/get_historys" => get_historys(params),
        _ => method_not_found(params),
    }
}

fn method_not_found(params: HashMap<String, String>) -> String {
    println!("not match;params={:?}", params);
    ReqResult {
        success: false,
        msg: "找不到方法".to_string(),
        code: -2,
        data: "".to_string(),
    }
    .json()
}

fn test() -> String {
    println!("匹配到了 /hey");

    ReqResult {
        success: true,
        msg: "请求成功".to_string(),
        code: 0,
        data: "hello tiny http".to_string(),
    }
    .json()
}

// 历史记录
fn add_history(params: HashMap<String, String>) -> String {
    History::add(params).json()
}
fn set_history(params: HashMap<String, String>) -> String {
    History::set(params).json()
}
fn del_history(params: HashMap<String, String>) -> String {
    History::del(utils::parse_string(&params, "id", "")).json()
}
fn get_history(params: HashMap<String, String>) -> String {
    History::get(utils::parse_string(&params, "id", "")).json()
}
fn get_historys(params: HashMap<String, String>) -> String {
    let beg = utils::parse_int(&params, "begTime", 0);
    let end = utils::parse_int(&params, "endTime", 0);
    let page = utils::parse_int(&params, "page", 1);
    let limit = utils::parse_int(&params, "limit", 0);
    let start = if page > 0 { (page - 1) * limit } else { 0 };
    History::get_all(beg, end, start, limit).json()
}

// 配置
fn add_config(params: HashMap<String, String>) -> String {
    MapData::add(params).json()
}
fn set_config(params: HashMap<String, String>) -> String {
    MapData::set(params).json()
}
fn get_config(params: HashMap<String, String>) -> String {
    MapData::get(utils::parse_string(&params, "id", "")).json()
}
