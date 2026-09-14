use thiserror::Error;

#[derive(Debug, Error)]
pub enum SniffError {
    #[error("{0}")]
    Message(String),
    #[error("{path}: {source}")]
    Io {
        path: String,
        #[source]
        source: std::io::Error,
    },
}

pub type Result<T> = std::result::Result<T, SniffError>;

pub fn message(value: impl Into<String>) -> SniffError {
    SniffError::Message(value.into())
}
