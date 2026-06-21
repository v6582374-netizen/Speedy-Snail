# Speedy Snail

Speedy Snail 是一个用于 YouTube、百度网盘网页视频预览和 MasterClass 课程视频的
小型 Chrome 扩展。按住 `ArrowRight` 250ms 后，当前视频会临时以你选择的速度播放；
松开按键后会恢复到之前的播放速度。短按 `ArrowRight` 仍然会向前快进 5 秒。

点击扩展图标可以选择按住时使用 `1.5x`、`2x` 或 `3x` 的播放速度。弹窗中还包含
“自动最高画质”开关。开启后，Speedy Snail 会根据当前显示器配置，让 YouTube 保持在适合
屏幕的最高可用画质，不会考虑网络状况。自动画质选择仅适用于 YouTube。弹窗还会显示
累计快进时长和预计节省的时间，这些统计数据会存储在 `chrome.storage.local` 中，
因此扩展更新后仍会保留。

## 在 Chrome 中加载

1. 打开 `chrome://extensions`。
2. 启用 **开发者模式**。
3. 点击 **加载已解压的扩展程序**。
4. 选择这个项目文件夹。

## 行为说明

- 运行于 `https://www.youtube.com/*`、`https://pan.baidu.com/*`、
  `https://masterclass.com/*` 和 `https://*.masterclass.com/*`。
- 会忽略搜索框、重命名输入框等可编辑区域。
- 会在窗口失焦、标签页隐藏以及 YouTube 单页应用导航时清理临时状态。
- 使用 `chrome.storage.sync` 存储速度和画质偏好。
- 使用 `chrome.storage.local` 存储使用统计数据。
- 使用 Chrome 的显示器信息权限来选择与屏幕匹配的最高画质。

## 图标

图标使用了自定义快进徽章，灵感来自现代播放器控件。
