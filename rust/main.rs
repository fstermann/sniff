mod adapters;
mod cli;
mod config;
mod discovery;
mod error;
mod models;
mod report;
mod rules;

fn main() {
    if let Err(error) = cli::run() {
        eprintln!("sniff: error: {error}");
        std::process::exit(2);
    }
}
