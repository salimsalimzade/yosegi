---
"yosegi-solid": minor
---

Add FileUpload: a dashed dropzone to drag files onto, or click or press Enter to browse, with a row per file below it showing its type, name, size and status. With `upload(file, { onProgress, signal })` it sends each file, `concurrency` at a time, with a progress bar, Cancel, and Retry when an upload fails; without it the files are only collected and go with a form through `name`. `accept`, `maxFileSize` and `maxFiles` refuse files with the reason on their row (and through `onReject`), the dropzone says when the limit is reached, and `multiple={false}` takes one file that a new one replaces. It has the field's label, description, error message, disabled, read-only and required states, takes `value`/`defaultValue`/`onChange`, and can be built from its parts (`FileUpload.Dropzone`, `FileUpload.List`, `FileUpload.Item`, …); its words change through `labels` or a LocaleProvider. Also adds `UploadIcon` and `RetryIcon`.
