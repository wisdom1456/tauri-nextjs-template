// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use anyhow::Result;
use mistralrs::{
    IsqType, PagedAttentionMetaBuilder,
    RequestBuilder, TextMessageRole, TextMessages, TextModelBuilder
};
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {}", epoch_ms)
}

#[tauri::command]
async fn chat(message: String) -> Result<String, String> {
  // Initialize the model for this request
  let model = TextModelBuilder::new("microsoft/Phi-3.5-mini-instruct".to_string())
    .with_isq(IsqType::Q8_0)
    .with_logging()
    .with_paged_attn(|| PagedAttentionMetaBuilder::default().build())
    .map_err(|e| e.to_string())?
    .build()
    .await
    .map_err(|e| e.to_string())?;

  // Create a message structure with the user's message
  let messages = TextMessages::new()
    .add_message(TextMessageRole::User, &message);

  // Get response
  let response = model.send_chat_request(messages)
    .await
    .map_err(|e| e.to_string())?;

  // Extract the assistant's response
  let content = response.choices[0]
    .message
    .content
    .as_ref()
    .ok_or_else(|| "No content in response".to_string())?
    .clone();

  Ok(content)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![greet, chat])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
