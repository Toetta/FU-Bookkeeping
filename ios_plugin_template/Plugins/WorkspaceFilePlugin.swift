import Foundation
import Capacitor
import UniformTypeIdentifiers

@objc(WorkspaceFilePlugin)
public class WorkspaceFilePlugin: CAPPlugin, UIDocumentPickerDelegate {

    private var openCall: CAPPluginCall?
    private var saveCall: CAPPluginCall?
    private let bookmarkKey = "FU_WORKSPACE_BOOKMARK"

    @objc func openFile(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.openCall = call
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.json], asCopy: false)
            picker.delegate = self
            picker.allowsMultipleSelection = false
            self.bridge?.viewController?.present(picker, animated: true)
        }
    }

    @objc func saveFile(_ call: CAPPluginCall) {
        guard let json = call.getString("json") else { call.reject("Missing 'json'"); return }
        if let url = resolveBookmark() {
            write(json: json, to: url) { ok, err in
                ok ? call.resolve(["ok": true]) : call.reject(err ?? "Failed to save")
            }
            return
        }
        saveAs(call)
    }

    @objc func saveAs(_ call: CAPPluginCall) {
        guard let json = call.getString("json") else { call.reject("Missing 'json'"); return }
        DispatchQueue.main.async {
            self.saveCall = call
            let tmp = FileManager.default.temporaryDirectory.appendingPathComponent("bookkeeping.json")
            do {
                try (json.data(using: .utf8) ?? Data()).write(to: tmp, options: .atomic)
            } catch {
                call.reject("Failed to prepare temp file: \(error.localizedDescription)")
                return
            }
            let picker = UIDocumentPickerViewController(forExporting: [tmp], asCopy: true)
            picker.delegate = self
            self.bridge?.viewController?.present(picker, animated: true)
        }
    }

    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let url = urls.first else { return }
        let ok = url.startAccessingSecurityScopedResource()
        defer { if ok { url.stopAccessingSecurityScopedResource() } }

        saveBookmark(for: url)

        if let call = openCall {
            do {
                let data = try Data(contentsOf: url)
                call.resolve([ "json": String(data: data, encoding: .utf8) ?? "", "name": url.lastPathComponent ])
            } catch {
                call.reject("Failed to read file: \(error.localizedDescription)")
            }
            openCall = nil
            return
        }

        if let call = saveCall {
            call.resolve([ "ok": true, "name": url.lastPathComponent ])
            saveCall = nil
        }
    }

    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        openCall?.reject("cancelled"); openCall = nil
        saveCall?.reject("cancelled"); saveCall = nil
    }

    private func write(json: String, to url: URL, completion: @escaping (Bool, String?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            let ok = url.startAccessingSecurityScopedResource()
            defer { if ok { url.stopAccessingSecurityScopedResource() } }
            do {
                try (json.data(using: .utf8) ?? Data()).write(to: url, options: .atomic)
                completion(true, nil)
            } catch {
                completion(false, error.localizedDescription)
            }
        }
    }

    private func saveBookmark(for url: URL) {
        do {
            let data = try url.bookmarkData(options: .withSecurityScope, includingResourceValuesForKeys: nil, relativeTo: nil)
            UserDefaults.standard.set(data, forKey: bookmarkKey)
        } catch { }
    }

    private func resolveBookmark() -> URL? {
        guard let data = UserDefaults.standard.data(forKey: bookmarkKey) else { return nil }
        var stale = false
        return try? URL(resolvingBookmarkData: data, options: [.withSecurityScope], relativeTo: nil, bookmarkDataIsStale: &stale)
    }
}
