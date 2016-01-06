# Change Log
All notable changes to this project will be documented in this file. For change log formatting, see http://keepachangelog.com/

## Unreleased

Keep future unreleased changes here

## 3.0.0

### Changed

- The internal attribute `status` was changed to `http_status` to make sure for `status` keys in the response body. If you are using `ErrorHTTP` this change is transparent, but if you are creating own error objects these need to be changed from `status` to` http_status`
