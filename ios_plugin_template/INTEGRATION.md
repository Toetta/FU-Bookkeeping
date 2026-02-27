## iOS plugin integration (after `npx cap add ios`)
1) Copy:
   `ios_plugin_template/Plugins/WorkspaceFilePlugin.swift`
   to:
   `ios/App/App/Plugins/WorkspaceFilePlugin.swift`

2) Register plugin in `ios/App/App/AppDelegate.swift`.
   Add inside `application(_:didFinishLaunchingWithOptions:)` (or wherever plugins are registered):

   ```swift
   CAPBridge.registerPlugin(WorkspaceFilePlugin.self)
   ```

3) Run:
   `npm run cap:sync`
   then open Xcode (`npm run cap:open:ios`) and build.
