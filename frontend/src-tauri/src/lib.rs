// Tauri shell — spawns the PyInstaller-built FastAPI sidecar, reads the dynamic
// free port it prints on stdout, exposes it to the WebView via the
// `sidecar_url` command, and kills the sidecar on exit. Same in dev and release.

use std::sync::Mutex;

use tauri::async_runtime::spawn;
use tauri::{AppHandle, Manager, RunEvent, State};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

const FALLBACK_URL: &str = "http://127.0.0.1:8770";
const SIDECAR_NAME: &str = "image-sorter-sidecar";

#[derive(Default)]
struct SidecarState {
    port: Mutex<Option<u16>>,
    child: Mutex<Option<CommandChild>>,
}

/// Resolve the sidecar base URL, waiting up to ~10 s for the port handshake.
/// Falls back to the fixed port if the sidecar never reports one.
#[tauri::command]
async fn sidecar_url(state: State<'_, SidecarState>) -> Result<String, String> {
    for _ in 0..100 {
        let port = *state.port.lock().unwrap();
        if let Some(p) = port {
            return Ok(format!("http://127.0.0.1:{p}"));
        }
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }
    Ok(FALLBACK_URL.to_string())
}

fn spawn_sidecar(app: &AppHandle) {
    let command = match app.shell().sidecar(SIDECAR_NAME) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("[image-sorter] sidecar binary not found ({e}); run `bun run tauri:prepare-sidecar`");
            return;
        }
    };

    let (mut rx, child) = match command.spawn() {
        Ok(v) => v,
        Err(e) => {
            eprintln!("[image-sorter] failed to spawn sidecar: {e}");
            return;
        }
    };
    app.state::<SidecarState>()
        .child
        .lock()
        .unwrap()
        .replace(child);

    let handle = app.clone();
    spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let text = String::from_utf8_lossy(&line);
                    if let Some(rest) = text.trim().strip_prefix("SIDECAR_PORT=") {
                        if let Ok(p) = rest.trim().parse::<u16>() {
                            *handle.state::<SidecarState>().port.lock().unwrap() = Some(p);
                            println!("[image-sorter] sidecar ready on port {p}");
                        }
                    }
                }
                CommandEvent::Stderr(line) => {
                    eprintln!("[sidecar] {}", String::from_utf8_lossy(&line).trim_end());
                }
                CommandEvent::Terminated(payload) => {
                    eprintln!("[image-sorter] sidecar terminated: {payload:?}");
                    *handle.state::<SidecarState>().port.lock().unwrap() = None;
                }
                _ => {}
            }
        }
    });
}

fn kill_sidecar(app: &AppHandle) {
    if let Some(child) = app.state::<SidecarState>().child.lock().unwrap().take() {
        let _ = child.kill();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(SidecarState::default())
        .invoke_handler(tauri::generate_handler![sidecar_url])
        .setup(|app| {
            spawn_sidecar(&app.handle().clone());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building the Image Sorter application")
        .run(|app, event| {
            if let RunEvent::ExitRequested { .. } = event {
                kill_sidecar(app);
            }
        });
}
